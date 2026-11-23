package main

import (
	"container/heap"
	"fmt"
)

type IntHeap []int

func (h IntHeap) Len() int           { return len(h) }
func (h IntHeap) Less(i, j int) bool { return h[i] < h[j] }
func (h IntHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *IntHeap) Push(v any)        { *h = append(*h, v.(int)) }
func (h *IntHeap) Pop() any          { old := *h; i := len(old) - 1; v := old[i]; *h = old[:i]; return v }

func main() {
	values := IntHeap{4, 2, 6}
	heap.Init(&values)
	fmt.Println("minimum", heap.Pop(&values), "remaining", values.Len())
}
