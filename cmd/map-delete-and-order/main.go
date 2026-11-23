package main

import (
	"fmt"
	"sort"
)

func main() {
	scores := map[string]int{"Ada": 3, "Grace": 5, "Lin": 7}
	delete(scores, "Ada")
	keys := make([]string, 0, len(scores))
	for name := range scores {
		keys = append(keys, name)
	}
	sort.Strings(keys)
	fmt.Println("names", keys)
}
