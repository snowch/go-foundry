package main

import (
	"fmt"
)

type Node struct {
	Value int
	Next  *Node
}

func main() {
	head := &Node{Value: 8}
	head = &Node{Value: 3, Next: head}
	values := []int{}
	for node := head; node != nil; node = node.Next {
		values = append(values, node.Value)
	}
	fmt.Println(values)
}
