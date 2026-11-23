package main

import (
	"fmt"
	"strings"
)

func main() {
	text := "  Ada   Lin "
	words := strings.Fields(text)
	fmt.Println("words", len(words), words)
	fmt.Printf("normalized=%q\n", strings.Join(words, " "))
}
