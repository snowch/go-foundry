// Package store is a bounded, single-writer record store for the runtime probe.
// It is not a production database or an implementation of the full SQL language.
package store

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"unicode/utf8"
)

const MaxRows = 4096

var ErrDuplicate = errors.New("duplicate id")
var ErrMissing = errors.New("id not found")

type Row struct {
	ID    uint64 `json:"id"`
	Name  string `json:"name"`
	Score int    `json:"score"`
}

func (row Row) validate() error {
	if row.ID > 2147483647 {
		return errors.New("id exceeds 2147483647")
	}
	if !utf8.ValidString(row.Name) || len(row.Name) < 1 || len(row.Name) > 32 {
		return errors.New("name must contain 1 to 32 UTF-8 bytes")
	}
	if row.Score < 0 || row.Score > 100 {
		return errors.New("score must be from 0 to 100")
	}
	return nil
}

type Snapshot struct {
	Format     string `json:"format"`
	Generation uint64 `json:"generation"`
	Rows       []Row  `json:"rows"`
}

type envelope struct {
	Payload json.RawMessage `json:"payload"`
	SHA256  string          `json:"sha256"`
}

func empty() Snapshot { return Snapshot{Format: "GDF1", Rows: []Row{}} }

func (db Snapshot) validate() error {
	if db.Format != "GDF1" {
		return errors.New("unsupported database format")
	}
	if len(db.Rows) > MaxRows {
		return errors.New("row limit exceeded")
	}
	for i, row := range db.Rows {
		if err := row.validate(); err != nil {
			return err
		}
		if i > 0 && db.Rows[i-1].ID >= row.ID {
			return errors.New("ids must be unique and sorted")
		}
	}
	return nil
}

func decode(data []byte, target any) error {
	reader := json.NewDecoder(bytes.NewReader(data))
	reader.DisallowUnknownFields()
	if err := reader.Decode(target); err != nil {
		return err
	}
	var extra any
	if err := reader.Decode(&extra); err != io.EOF {
		return errors.New("unexpected data after JSON value")
	}
	return nil
}

func Open(path string) (Snapshot, error) {
	data, err := os.ReadFile(path)
	if errors.Is(err, os.ErrNotExist) {
		return empty(), nil
	}
	if err != nil {
		return Snapshot{}, err
	}
	var encoded envelope
	if err := decode(data, &encoded); err != nil {
		return Snapshot{}, fmt.Errorf("invalid envelope: %w", err)
	}
	digest := sha256.Sum256(encoded.Payload)
	if hex.EncodeToString(digest[:]) != encoded.SHA256 {
		return Snapshot{}, errors.New("snapshot checksum mismatch")
	}
	var db Snapshot
	if err := decode(encoded.Payload, &db); err != nil {
		return Snapshot{}, fmt.Errorf("invalid snapshot: %w", err)
	}
	if err := db.validate(); err != nil {
		return Snapshot{}, err
	}
	return db, nil
}

func (db Snapshot) Get(id uint64) (Row, bool) {
	i := sort.Search(len(db.Rows), func(i int) bool { return db.Rows[i].ID >= id })
	if i == len(db.Rows) || db.Rows[i].ID != id {
		return Row{}, false
	}
	return db.Rows[i], true
}

func (db Snapshot) Insert(row Row) (Snapshot, error) {
	if err := row.validate(); err != nil {
		return Snapshot{}, err
	}
	if _, exists := db.Get(row.ID); exists {
		return Snapshot{}, ErrDuplicate
	}
	if len(db.Rows) == MaxRows {
		return Snapshot{}, errors.New("row limit exceeded")
	}
	if db.Generation == ^uint64(0) {
		return Snapshot{}, errors.New("generation overflow")
	}
	next := Snapshot{Format: "GDF1", Generation: db.Generation + 1, Rows: append(append([]Row{}, db.Rows...), row)}
	sort.Slice(next.Rows, func(i, j int) bool { return next.Rows[i].ID < next.Rows[j].ID })
	return next, nil
}

// Save validates before replacing. A successful rename publishes one complete
// virtual-filesystem file; it is not a claim about physical power-loss durability.
func Save(path string, db Snapshot) error {
	if err := db.validate(); err != nil {
		return err
	}
	payload, err := json.Marshal(db)
	if err != nil {
		return err
	}
	digest := sha256.Sum256(payload)
	data, err := json.Marshal(envelope{Payload: payload, SHA256: hex.EncodeToString(digest[:])})
	if err != nil {
		return err
	}
	file, err := os.CreateTemp(filepath.Dir(path), ".go-foundry-*")
	if err != nil {
		return err
	}
	name := file.Name()
	defer os.Remove(name)
	if _, err = file.Write(append(data, '\n')); err != nil {
		file.Close()
		return err
	}
	if err = file.Close(); err != nil {
		return err
	}
	return os.Rename(name, path)
}
