package main

import (
	"example.com/go-foundry/internal/store"
	"fmt"
)

func main() {
	db := store.Snapshot{Format: "GDF1", Rows: []store.Row{}}
	db, err := db.Insert(store.Row{ID: 7, Name: "Ada", Score: 42})
	if err != nil {
		panic(err)
	}
	next, err := db.Update(store.Row{ID: 7, Name: "Ada", Score: 60})
	if err != nil {
		panic(err)
	}
	fmt.Println("old", db.Rows[0].Score, "new", next.Rows[0].Score)
}
