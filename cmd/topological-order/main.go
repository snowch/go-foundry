package main

import (
	"fmt"
)

func topological(g [][]int) ([]int, bool) {
	indegree := make([]int, len(g))
	for _, neighbors := range g {
		for _, next := range neighbors {
			indegree[next]++
		}
	}
	order := []int{}
	used := make([]bool, len(g))
	for len(order) < len(g) {
		chosen := -1
		for i, n := range indegree {
			if n == 0 && !used[i] {
				chosen = i
				break
			}
		}
		if chosen < 0 {
			return order, false
		}
		used[chosen] = true
		order = append(order, chosen)
		for _, next := range g[chosen] {
			indegree[next]--
		}
	}
	return order, true
}

func main() {
	graph := [][]int{{1}, {2}, {}}
	order, complete := topological(graph)
	fmt.Println("order", order, "complete", complete)
}
