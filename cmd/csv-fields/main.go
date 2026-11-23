package main

import (
	"encoding/csv"
	"fmt"
	"strings"
)

func main() {
	reader := csv.NewReader(strings.NewReader("name,score\n\"Ada, Lovelace\",42\n"))
	records, err := reader.ReadAll()
	if err != nil {
		panic(err)
	}
	fmt.Printf("fields %d name %q score %s\n", len(records[1]), records[1][0], records[1][1])
}
