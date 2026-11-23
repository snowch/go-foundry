package main

import (
	"fmt"
	"strings"
)

func main() {
	words := strings.Fields("go Go go")
	counts := make(map[string]int)
	for _, word := range words {
		counts[word]++
	}
	fmt.Println("go", counts["go"], "Go", counts["Go"])
}
