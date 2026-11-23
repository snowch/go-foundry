package main

import (
	"bytes"
	"example.com/go-foundry/internal/store"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	db := store.Snapshot{Format: "GDF1", Rows: []store.Row{}}
	db, err := db.Insert(store.Row{ID: 7, Name: "Ada", Score: 42})
	if err != nil {
		panic(err)
	}
	folder, err := os.MkdirTemp("", "go-db-check-")
	if err != nil {
		panic(err)
	}
	defer os.RemoveAll(folder)
	path := filepath.Join(folder, "db.gdb")
	if err := store.Save(path, db); err != nil {
		panic(err)
	}
	corrupt := true
	if corrupt {
		data, err := os.ReadFile(path)
		if err != nil {
			panic(err)
		}
		data = bytes.Replace(data, []byte("Ada"), []byte("Eve"), 1)
		if err := os.WriteFile(path, data, 0600); err != nil {
			panic(err)
		}
	}
	loaded, err := store.Open(path)
	if err != nil {
		fmt.Println("rejected", strings.Contains(err.Error(), "checksum"))
		return
	}
	fmt.Println("reopened", loaded.Rows[0].Name)
}
