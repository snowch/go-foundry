package main

import "testing"

var benchmarkSink []int

func BenchmarkCopy(b *testing.B) {
	input := []int{1, 2, 3}
	b.ReportAllocs()
	for index := 0; index < b.N; index++ {
		benchmarkSink = append([]int(nil), input...)
	}
}
