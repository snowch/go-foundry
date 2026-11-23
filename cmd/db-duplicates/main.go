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
	next, err := db.Insert(store.Row{ID: 7, Name: "Lin", Score: 60})
	if err != nil {
		fmt.Println("duplicate", errors.Is(err, store.ErrDuplicate), "rows before", len(db.Rows))
		return
	}
	fmt.Println("rows after", len(next.Rows))
}
