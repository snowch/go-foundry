package main

import (
	"fmt"
)

type Edge struct{ to, cost int }

func shortest(g [][]Edge, start, target int) int {
	const infinity = 1 << 28
	distance := make([]int, len(g))
	used := make([]bool, len(g))
	for i := range distance {
		distance[i] = infinity
	}
	distance[start] = 0
	for range g {
		v := -1
		for i := range g {
			if !used[i] && (v < 0 || distance[i] < distance[v]) {
				v = i
			}
		}
		if v < 0 || distance[v] == infinity {
			break
		}
		used[v] = true
		for _, edge := range g[v] {
			if distance[v]+edge.cost < distance[edge.to] {
				distance[edge.to] = distance[v] + edge.cost
			}
		}
	}
	if distance[target] == infinity {
		return -1
	}
	return distance[target]
}

func main() {
	graph := [][]Edge{{{1, 2}, {2, 5}}, {{2, 1}}, {}}
	fmt.Println("distance to C", shortest(graph, 0, 2))
}
