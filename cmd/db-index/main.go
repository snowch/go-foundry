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
	db, err = db.Insert(store.Row{ID: 8, Name: "Ada", Score: 60})
	if err != nil {
		panic(err)
	}
	index := map[string][]uint64{}
	for _, row := range db.Rows {
		index[row.Name] = append(index[row.Name], row.ID)
	}
	fmt.Println("Ada", index["Ada"])
}
