package main

import (
	"example.com/go-foundry/internal/store"
	"fmt"
)

func main() {
	db := store.Snapshot{Format: "GDF1", Rows: []store.Row{}}
	next, err := db.Insert(store.Row{ID: 7, Name: "Ada", Score: 101})
	if err != nil {
		fmt.Println("rejected", err)
		return
	}
	fmt.Println("inserted", next.Rows[0].ID)
}
