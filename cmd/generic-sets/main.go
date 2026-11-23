package main

import (
	"fmt"
)

type Set[T comparable] map[T]struct{}

func (s Set[T]) Add(value T)      { s[value] = struct{}{} }
func (s Set[T]) Has(value T) bool { _, found := s[value]; return found }

func main() {
	names := make(Set[string])
	names.Add("go")
	fmt.Println("go", names.Has("go"), "rust", names.Has("rust"))
}
