package main

import (
	"fmt"
	"unicode/utf8"
)

func main() {
	text := "éGo"
	fmt.Println("bytes", len(text), "runes", utf8.RuneCountInString(text))
	for byteIndex, value := range text {
		fmt.Printf("%d:%c\n", byteIndex, value)
	}
}
