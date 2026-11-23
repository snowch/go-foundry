package main

import (
	"fmt"
	"time"
)

func main() {
	start, err := time.Parse(time.RFC3339, "2026-01-02T10:00:00+03:00")
	if err != nil {
		panic(err)
	}
	fmt.Println(start.Add(time.Hour).UTC().Format(time.RFC3339))
}
