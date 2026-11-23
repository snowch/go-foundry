package main

import (
	"fmt"
)

type Entry struct {
	key   string
	value int
}
type Table [2][]Entry

func (t *Table) put(k string, v int) {
	slot := len(k) % len(t)
	for i := range t[slot] {
		if t[slot][i].key == k {
			t[slot][i].value = v
			return
		}
	}
	t[slot] = append(t[slot], Entry{k, v})
}
func (t *Table) get(k string) (int, bool) {
	for _, e := range t[len(k)%len(t)] {
		if e.key == k {
			return e.value, true
		}
	}
	return 0, false
}

func main() {
	table := Table{}
	table.put("Ada", 3)
	table.put("Bob", 8)
	fmt.Println("bucket", 1, "entries", len(table[1]))
	value, ok := table.get("Bob")
	fmt.Println("lookup", value, ok)
}
