package main

import (
	"fmt"
)

type Node struct {
	Value       int
	Left, Right *Node
}

func insert(n *Node, v int) *Node {
	if n == nil {
		return &Node{Value: v}
	}
	if v < n.Value {
		n.Left = insert(n.Left, v)
	}
	if v > n.Value {
		n.Right = insert(n.Right, v)
	}
	return n
}
func walk(n *Node, out *[]int) {
	if n == nil {
		return
	}
	walk(n.Left, out)
	*out = append(*out, n.Value)
	walk(n.Right, out)
}

func main() {
	var root *Node
	for _, value := range []int{4, 2, 6} {
		root = insert(root, value)
	}
	values := []int{}
	walk(root, &values)
	fmt.Println(values)
}
