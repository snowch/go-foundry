package main

import (
	"fmt"
	"os"
)

func main() {
	path := "data/notes.txt"
	if err := os.MkdirAll("data", 0755); err != nil {
		panic(err)
	}
	if err := os.WriteFile(path, []byte("Ada\n"), 0644); err != nil {
		panic(err)
	}
	data, err := os.ReadFile(path)
	if err != nil {
		panic(err)
	}
	fmt.Printf("bytes %d text %q\n", len(data), data)
}
