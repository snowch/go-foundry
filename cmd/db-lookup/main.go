package main

import (
	"example.com/go-foundry/internal/store"
	"fmt"
)

func main() {
	db := store.Snapshot{Format: "GDF1", Rows: []store.Row{}}
	for _, row := range []store.Row{{ID: 9, Name: "Lin", Score: 60}, {ID: 7, Name: "Ada", Score: 42}, {ID: 3, Name: "Sam", Score: 50}} {
		var err error
		db, err = db.Insert(row)
		if err != nil {
			panic(err)
		}
	}
	ids := []uint64{}
	for _, row := range db.Rows {
		ids = append(ids, row.ID)
	}
	fmt.Println("stored", ids)
	row, found := db.Get(7)
	fmt.Println("found", row.Name, found)
}
