package main

import (
	"bufio"
	"fmt"
	"strings"
)

func main() {
	scanner := bufio.NewScanner(strings.NewReader("Ada\nLin\n"))
	line := 0
	for scanner.Scan() {
		line++
		fmt.Println("line", line, scanner.Text())
	}
	if err := scanner.Err(); err != nil {
		panic(err)
	}
}
