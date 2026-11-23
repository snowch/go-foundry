package main

import (
	"errors"
	"example.com/go-foundry/internal/store"
	"fmt"
)

func main() {
	db := store.Snapshot{Format: "GDF1", Rows: []store.Row{}}
	db, err := db.Insert(store.Row{ID: 7, Name: "Ada", Score: 42})
	if err != nil {
		panic(err)
	}
	next, err := db.Delete(7)
	if err != nil {
		fmt.Println("missing", errors.Is(err, store.ErrMissing), "old rows", len(db.Rows))
		return
	}
	fmt.Println("old rows", len(db.Rows), "new rows", len(next.Rows))
}
