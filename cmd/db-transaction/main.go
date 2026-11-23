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
	next, err := db.Transaction(func(work store.Snapshot) (store.Snapshot, error) {
		changed, err := work.Update(store.Row{ID: 7, Name: "Ada", Score: 60})
		if err != nil {
			return work, err
		}
		return changed.Insert(store.Row{ID: 7, Name: "Lin", Score: 50})
	})
	fmt.Println("rolled back", err != nil, "score", next.Rows[0].Score, "rows", len(next.Rows))
}
