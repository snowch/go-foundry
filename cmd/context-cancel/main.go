package main

import (
	"context"
	"fmt"
)

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	stopped := make(chan string)
	go func() { <-ctx.Done(); stopped <- "cancelled " + ctx.Err().Error() }()
	cancel()
	fmt.Println(<-stopped)
}
