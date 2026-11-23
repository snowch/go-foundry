package main

import (
	"fmt"
)

func dfs(graph map[string][]string, start string) []string {
	seen := map[string]bool{}
	order := []string{}
	var visit func(string)
	visit = func(v string) {
		if seen[v] {
			return
		}
		seen[v] = true
		order = append(order, v)
		for _, next := range graph[v] {
			visit(next)
		}
	}
	visit(start)
	return order
}

func main() {
	graph := map[string][]string{"A": {"B", "C"}, "B": {"D"}, "C": {"D"}, "D": {"A"}}
	fmt.Println(dfs(graph, "A"))
}
