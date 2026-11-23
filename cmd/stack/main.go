package main

import (
	"fmt"
)

type Stack []int

func (s *Stack) push(v int) { *s = append(*s, v) }
func (s *Stack) pop() (int, bool) {
	if len(*s) == 0 {
		return 0, false
	}
	last := len(*s) - 1
	value := (*s)[last]
	*s = (*s)[:last]
	return value, true
}

func main() {
	stack := Stack{}
	stack.push(3)
	stack.push(8)
	value, ok := stack.pop()
	fmt.Println("top", value, ok, "remaining", stack)
}
