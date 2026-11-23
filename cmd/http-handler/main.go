package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "hello "+r.URL.Query().Get("name"))
}

func main() {
	request := httptest.NewRequest("GET", "/hello?name=Ada", nil)
	response := httptest.NewRecorder()
	handler(response, request)
	fmt.Println("status", response.Code, "body", response.Body.String())
}
