package main

import (
	"fmt"
)

func bfs(graph map[string][]string, start string) []string {
	seen := map[string]bool{start: true}
	queue := []string{start}
	order := []string{}
	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:]
		order = append(order, current)
		for _, next := range graph[current] {
			if !seen[next] {
				seen[next] = true
				queue = append(queue, next)
			}
		}
	}
	return order
}

func main() {
	graph := map[string][]string{"A": {"B", "C"}, "B": {"D"}, "C": {"D"}}
	fmt.Println(bfs(graph, "A"))
}
