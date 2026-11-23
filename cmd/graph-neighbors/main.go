package main

import (
	"fmt"
)

func main() {
	graph := map[string][]string{"A": {"B", "C"}, "B": {"C"}, "C": {}}
	for _, vertex := range []string{"A", "B", "C"} {
		fmt.Println(vertex, "to", graph[vertex])
	}
}
