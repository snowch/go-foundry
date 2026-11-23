package main

import (
	"example.com/go-foundry/internal/store"
	"fmt"
	"os"
	"path/filepath"
)

func main() {
	db := store.Snapshot{Format: "GDF1", Rows: []store.Row{}}
	db, err := db.Insert(store.Row{ID: 7, Name: "Ada", Score: 42})
	if err != nil {
		panic(err)
	}
	folder, err := os.MkdirTemp("", "go-db-save-")
	if err != nil {
		panic(err)
	}
	defer os.RemoveAll(folder)
	path := filepath.Join(folder, "db.gdb")
	if err := store.Save(path, db); err != nil {
		panic(err)
	}
	candidate := db
	candidate.Rows = append([]store.Row{}, db.Rows...)
	candidate.Rows[0].Score = 101
	err = store.Save(path, candidate)
	fmt.Println("rejected", err != nil)
	loaded, err := store.Open(path)
	if err != nil {
		panic(err)
	}
	fmt.Println("saved score", loaded.Rows[0].Score)
}
