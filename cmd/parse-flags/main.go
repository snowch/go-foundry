package main

import (
	"flag"
	"fmt"
	"io"
)

func main() {
	options := flag.NewFlagSet("example", flag.ContinueOnError)
	options.SetOutput(io.Discard)
	count := options.Int("count", 1, "number of items")
	args := []string{"-count", "3"}
	if err := options.Parse(args); err != nil {
		fmt.Println("invalid option", err)
		return
	}
	fmt.Println("count", *count)
}
