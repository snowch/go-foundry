package main

import (
	"fmt"
)

type Ring struct {
	slots       []int
	head, count int
}

func (r *Ring) put(v int) bool {
	if r.count == len(r.slots) {
		return false
	}
	r.slots[(r.head+r.count)%len(r.slots)] = v
	r.count++
	return true
}
func (r *Ring) take() (int, bool) {
	if r.count == 0 {
		return 0, false
	}
	v := r.slots[r.head]
	r.head = (r.head + 1) % len(r.slots)
	r.count--
	return v, true
}

func main() {
	queue := Ring{slots: make([]int, 2)}
	fmt.Println("accepted", queue.put(3), queue.put(8), queue.put(9))
	value, ok := queue.take()
	fmt.Println("removed", value, ok, "count", queue.count)
}
