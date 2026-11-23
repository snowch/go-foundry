package main

import (
	"fmt"
	"os"
	"strconv"

	"example.com/go-foundry/internal/store"
)

func run(args []string) error {
	if len(args) < 2 {
		return fmt.Errorf("usage: tinydb FILE insert ID NAME SCORE | get ID | list")
	}
	path, command := args[0], args[1]
	db, err := store.Open(path)
	if err != nil {
		return err
	}
	switch command {
	case "insert":
		if len(args) != 5 {
			return fmt.Errorf("insert needs ID NAME SCORE")
		}
		id, err := strconv.ParseUint(args[2], 10, 64)
		if err != nil {
			return fmt.Errorf("invalid id: %w", err)
		}
		score, err := strconv.Atoi(args[4])
		if err != nil {
			return fmt.Errorf("invalid score: %w", err)
		}
		next, err := db.Insert(store.Row{ID: id, Name: args[3], Score: score})
		if err != nil {
			return err
		}
		if err = store.Save(path, next); err != nil {
			return err
		}
		fmt.Printf("saved generation %d rows %d\n", next.Generation, len(next.Rows))
	case "get":
		if len(args) != 3 {
			return fmt.Errorf("get needs ID")
		}
		id, err := strconv.ParseUint(args[2], 10, 64)
		if err != nil {
			return fmt.Errorf("invalid id: %w", err)
		}
		row, found := db.Get(id)
		if !found {
			return store.ErrMissing
		}
		fmt.Printf("%d | %s | %d\n", row.ID, row.Name, row.Score)
	case "list":
		if len(args) != 2 {
			return fmt.Errorf("list takes no arguments")
		}
		for _, row := range db.Rows {
			fmt.Printf("%d | %s | %d\n", row.ID, row.Name, row.Score)
		}
		fmt.Printf("generation %d rows %d\n", db.Generation, len(db.Rows))
	default:
		return fmt.Errorf("unknown command %q", command)
	}
	return nil
}

func main() {
	if err := run(os.Args[1:]); err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1)
	}
}
