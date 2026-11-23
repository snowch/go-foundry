package main

import (
	"fmt"
)

type Rectangle struct{ Width, Height int }

func (r Rectangle) Area() int { return r.Width * r.Height }

func main() {
	rect := Rectangle{Width: 3, Height: 4}
	fmt.Println("area", rect.Area())
}
