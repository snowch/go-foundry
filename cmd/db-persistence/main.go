package main

import (
	"example.com/go-foundry/internal/store"
	"fmt"
	"os"
)

func main() {
	if err := os.MkdirAll("data", 0755); err != nil {
		panic(err)
	}
	path := "data/course-capstone.gdb"
	db, err := store.Open(path)
	if err != nil {
		panic(err)
	}
	old, found := db.Get(7)
	if found {
		fmt.Println("reopened before", old.Score)
	} else {
		fmt.Println("new database")
	}
	desiredScore := 42
	row := store.Row{ID: 7, Name: "Ada", Score: desiredScore}
	if found {
		db, err = db.Update(row)
	} else {
		db, err = db.Insert(row)
	}
	if err != nil {
		panic(err)
	}
	if err := store.Save(path, db); err != nil {
		panic(err)
	}
	loaded, err := store.Open(path)
	if err != nil {
		panic(err)
	}
	row, found = loaded.Get(7)
	if !found {
		panic("saved row missing")
	}
	fmt.Println("saved name", row.Name, "score", row.Score)
}
