package main

import (
	"fmt"
)

type State uint8

const (
	Idle State = iota
	Working
	Done
)

func main() {
	fmt.Println("idle", Idle, "working", Working, "done", Done)
}
