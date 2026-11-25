export const learningModels = {
  "slice-aliases": {
    "title": "Two slice indexes reach the same backing slot",
    "question": "Why do left[1] and right[0] both become 9?",
    "kind": "slots",
    "rows": [
      {
        "label": "Backing array before the assignment",
        "values": [
          2,
          4,
          6
        ],
        "note": "left covers indices 0,1; right covers indices 1,2.",
        "active": [
          1
        ],
        "muted": [],
        "tags": {
          "1": "left[1] / right[0]"
        }
      },
      {
        "label": "After left[1] = 9",
        "values": [
          2,
          9,
          6
        ],
        "note": "left prints [2,9]; backing prints [2,9,6]; right prints [9,6].",
        "active": [
          1
        ],
        "muted": [],
        "tags": {
          "1": "same shared slot"
        }
      }
    ],
    "note": "These are int element indices, not byte addresses. Both slices view one array; assigning a slice does not copy its elements.",
    "description": "Why do left[1] and right[0] both become 9? Backing array before the assignment: index 0 = 2, index 1 = 4, index 2 = 6. left covers indices 0,1; right covers indices 1,2.. After left[1] = 9: index 0 = 2, index 1 = 9, index 2 = 6. left prints [2,9]; backing prints [2,9,6]; right prints [9,6].. These are int element indices, not byte addresses. Both slices view one array; assigning a slice does not copy its elements."
  },
  "copy-slices": {
    "title": "copy writes into a separate backing array",
    "question": "Why does changing copied[0] leave original[0] equal to 2?",
    "kind": "references",
    "states": [
      {
        "label": "After copy, then copied[0]=9",
        "objects": [
          {
            "label": "Original backing array",
            "value": "[2,4,6]",
            "refs": [
              {
                "name": "original",
                "edge": "views this array"
              }
            ]
          },
          {
            "label": "Separate backing array",
            "value": "[9,4,6]",
            "refs": [
              {
                "name": "copied",
                "edge": "views the make-allocated array"
              }
            ]
          }
        ]
      }
    ],
    "note": "make creates another array here; copy copies three ints and returns count 3. The copied slice is not another alias of original.",
    "description": "Why does changing copied[0] leave original[0] equal to 2? After copy, then copied[0]=9: Original backing array contains [2,4,6]. original views this array Original backing array; Separate backing array contains [9,4,6]. copied views the make-allocated array Separate backing array. make creates another array here; copy copies three ints and returns count 3. The copied slice is not another alias of original."
  },
  "nil-interfaces": {
    "title": "A typed nil still gives an interface a dynamic type",
    "question": "Why is pointer==nil true while value==nil is false?",
    "kind": "table",
    "headings": [
      "Expression / conceptual field",
      "pointer",
      "value (any)",
      "Nil interface · contrast"
    ],
    "rows": [
      [
        "Declared type",
        "*int",
        "any",
        "any"
      ],
      [
        "Dynamic type",
        "not an interface",
        "*int",
        "absent"
      ],
      [
        "Contained value",
        "nil pointer",
        "nil pointer",
        "absent"
      ],
      [
        "Comparison with nil",
        "true",
        "false",
        "true"
      ]
    ],
    "label": "",
    "links": [],
    "note": "The nil-interface column is an explanatory comparison, not an extra starter print. The type/value pair is a conceptual model, not a guaranteed two-word ABI layout.",
    "description": "Why is pointer==nil true while value==nil is false? Expression / conceptual field; pointer; value (any); Nil interface · contrast. Declared type; *int; any; any; Dynamic type; not an interface; *int; absent; Contained value; nil pointer; nil pointer; absent; Comparison with nil; true; false; true. . . The nil-interface column is an explanatory comparison, not an extra starter print. The type/value pair is a conceptual model, not a guaranteed two-word ABI layout."
  },
  "worker-pool": {
    "title": "Sending, draining and closing have different owners",
    "question": "Why must main receive results before the workers can finish?",
    "kind": "graph",
    "note": "Close/wait order: producer closes jobs → both workers finish and call Done → coordinator Wait returns → close results → main range ends. Main receives while workers send, then sorts and prints [1,4,9,16]. Channel boxes show shared communication objects, not queued slots. Positions are not a time axis or evidence of multicore execution.",
    "description": "Four goroutines participate. One auxiliary goroutine produces jobs 1 through 4 and later coordinates shutdown. It sends on one unbuffered jobs channel; either worker may receive each job. Each worker sends its square through the same unbuffered results channel to main, which drains results while work is running. The producer closes jobs after the final send, waits for both workers to call Done, then closes results. Main finishes its range, sorts and prints [1,4,9,16]. No assignment of individual jobs to workers or timing order is implied.",
    "nodes": [
      {
        "id": "producer",
        "label": "Producer",
        "x": 16,
        "y": 18,
        "detail": "send 1..4"
      },
      {
        "id": "jobs",
        "label": "jobs",
        "x": 16,
        "y": 50,
        "detail": "unbuffered channel"
      },
      {
        "id": "worker1",
        "label": "Worker 1",
        "x": 50,
        "y": 18
      },
      {
        "id": "worker2",
        "label": "Worker 2",
        "x": 50,
        "y": 82
      },
      {
        "id": "results",
        "label": "results",
        "x": 84,
        "y": 50,
        "detail": "unbuffered channel"
      },
      {
        "id": "main",
        "label": "main",
        "x": 84,
        "y": 18,
        "detail": "receive; sort"
      }
    ],
    "edges": [
      {
        "from": "producer",
        "to": "jobs",
        "label": "",
        "x": 8,
        "y": 33
      },
      {
        "from": "jobs",
        "to": "worker1",
        "label": ""
      },
      {
        "from": "jobs",
        "to": "worker2",
        "label": ""
      },
      {
        "from": "worker1",
        "to": "results",
        "label": "",
        "x": 74,
        "y": 30
      },
      {
        "from": "worker2",
        "to": "results",
        "label": "",
        "x": 74,
        "y": 70
      },
      {
        "from": "results",
        "to": "main",
        "label": "",
        "x": 92,
        "y": 33
      }
    ],
    "legend": "Producer + coordinator (one goroutine), two worker goroutines, and main. Each worker squares the received job. Both workers share one jobs channel and one results channel.",
    "height": 420
  },
  "linked-list": {
    "title": "Prepending changes head and adds one next link",
    "question": "Which node does the new node 3 point to?",
    "kind": "graph",
    "nodes": [
      {
        "id": "h",
        "label": "head",
        "x": 12,
        "y": 50
      },
      {
        "id": "3",
        "label": "3",
        "x": 45,
        "y": 50
      },
      {
        "id": "8",
        "label": "8",
        "x": 78,
        "y": 50
      }
    ],
    "edges": [
      {
        "from": "h",
        "to": "3",
        "label": ""
      },
      {
        "from": "3",
        "to": "8",
        "label": "Next"
      }
    ],
    "legend": "After prepending: head → 3 → 8 → nil. The old node 8 is reused; its Next is nil.",
    "height": 160,
    "note": "These positions show logical links, not physical adjacency or a fixed allocation layout.",
    "description": "Which node does the new node 3 point to? Nodes: head, 3, 8. Connections: head leads to 3; 3 leads to 8 (Next). After prepending: head → 3 → 8 → nil. The old node 8 is reused; its Next is nil.. These positions show logical links, not physical adjacency or a fixed allocation layout."
  },
  "db-publish": {
    "title": "Guest-file replacement and browser saving are separate",
    "question": "Which failure must keep the previous destination intact?",
    "kind": "panels",
    "panels": [
      {
        "label": "Inside the guest filesystem",
        "model": {
          "kind": "branch",
          "root": "Candidate rows validate and complete temporary write/close succeed?",
          "paths": [
            {
              "when": "Yes",
              "result": "Rename the completed temporary file",
              "detail": "Publish the replacement in the guest filesystem."
            },
            {
              "when": "No",
              "result": "Keep the previous destination",
              "detail": "Do not publish an incomplete candidate."
            }
          ]
        }
      },
      {
        "label": "After the job finishes",
        "model": {
          "kind": "flow",
          "steps": [
            {
              "label": "Save browser project archive",
              "detail": "The runner persists the guest’s project state for a later start."
            }
          ]
        }
      }
    ],
    "note": "The archive save is a separate persistence boundary. Guest rename and browser storage do not prove physical-disk durability or production fsync ordering.",
    "description": "Which failure must keep the previous destination intact? Inside the guest filesystem. Candidate rows validate and complete temporary write/close succeed?. Yes. Rename the completed temporary file. Publish the replacement in the guest filesystem.; No. Keep the previous destination. Do not publish an incomplete candidate.; After the job finishes. Save browser project archive. The runner persists the guest’s project state for a later start.. The archive save is a separate persistence boundary. Guest rename and browser storage do not prove physical-disk durability or production fsync ordering."
  },
  "append-capacity": {
    "title": "Length grows inside existing capacity",
    "question": "Why does append(values,7,8) report grew=false?",
    "kind": "slots",
    "rows": [
      {
        "label": "make([]int,2,4)",
        "values": [
          0,
          0,
          0,
          0
        ],
        "note": "len=2, cap=4. Only indices 0 and 1 belong to the current slice.",
        "active": [
          0,
          1
        ],
        "muted": [
          2,
          3
        ],
        "tags": {
          "2": "outside len",
          "3": "outside len"
        }
      },
      {
        "label": "After append",
        "values": [
          0,
          0,
          7,
          8
        ],
        "note": "len=4, cap=4; the existing backing array has enough capacity.",
        "active": [
          0,
          1,
          2,
          3
        ],
        "muted": []
      }
    ],
    "note": "Go zero-initializes the backing array. Spare capacity is not uninitialized memory, but it is outside this slice’s current length. Appending beyond capacity is a different case; no exact growth factor is promised.",
    "description": "Why does append(values,7,8) report grew=false? make([]int,2,4): index 0 = 0, index 1 = 0, index 2 = 0, index 3 = 0. len=2, cap=4. Only indices 0 and 1 belong to the current slice.. After append: index 0 = 0, index 1 = 0, index 2 = 7, index 3 = 8. len=4, cap=4; the existing backing array has enough capacity.. Go zero-initializes the backing array. Spare capacity is not uninitialized memory, but it is outside this slice’s current length. Appending beyond capacity is a different case; no exact growth factor is promised."
  },
  "buffered-channel": {
    "title": "Capacity bounds queued values",
    "question": "Why does one receive leave one pending value?",
    "kind": "slots",
    "rows": [
      {
        "label": "After sending 4, then 8",
        "values": [
          4,
          8
        ],
        "note": "len=2, cap=2; receive takes the oldest queued value, 4.",
        "active": [
          0,
          1
        ],
        "muted": [],
        "tags": {
          "0": "front"
        }
      },
      {
        "label": "After receiving 4",
        "values": [
          "removed",
          8
        ],
        "note": "len=1; 8 remains next to receive.",
        "active": [
          1
        ],
        "muted": [
          0
        ],
        "tags": {
          "1": "new front"
        }
      }
    ],
    "note": "This is logical queue occupancy, not the channel’s specified memory layout. A third send with no receiver would block; the unchanged program does not perform it.",
    "description": "Why does one receive leave one pending value? After sending 4, then 8: index 0 = 4, index 1 = 8. len=2, cap=2; receive takes the oldest queued value, 4.. After receiving 4: index 0 = removed, index 1 = 8. len=1; 8 remains next to receive.. This is logical queue occupancy, not the channel’s specified memory layout. A third send with no receiver would block; the unchanged program does not perform it."
  },
  "ring-buffer": {
    "title": "One fixed buffer tracks a moving head",
    "question": "Why is put(9) rejected and take returns 3?",
    "kind": "slots",
    "rows": [
      {
        "label": "After put(3), put(8)",
        "values": [
          3,
          8
        ],
        "note": "head=0, count=2; full capacity=2. put(9) returns false without overwriting.",
        "active": [
          0,
          1
        ],
        "muted": [],
        "tags": {
          "0": "head"
        }
      },
      {
        "label": "After take returns 3",
        "values": [
          3,
          8
        ],
        "note": "head=1, count=1. The old bits at slot 0 are not a live queue item.",
        "active": [
          1
        ],
        "muted": [
          0
        ],
        "tags": {
          "1": "head"
        }
      }
    ],
    "note": "These are the actual two slots in the starter. Logical queue order and physical array index are different; fullness is checked before insertion.",
    "description": "Why is put(9) rejected and take returns 3? After put(3), put(8): index 0 = 3, index 1 = 8. head=0, count=2; full capacity=2. put(9) returns false without overwriting.. After take returns 3: index 0 = 3, index 1 = 8. head=1, count=1. The old bits at slot 0 are not a live queue item.. These are the actual two slots in the starter. Logical queue order and physical array index are different; fullness is checked before insertion."
  },
  "unicode-text": {
    "title": "Rune iteration reports byte starting positions",
    "question": "Why do range indices jump from 0 to 2?",
    "kind": "bytes",
    "label": "éGo: three runes, four UTF-8 bytes",
    "values": [
      "C3",
      "A9",
      "47",
      "6F"
    ],
    "groups": [
      {
        "label": "é",
        "size": 2,
        "note": "range index 0"
      },
      {
        "label": "G",
        "size": 1,
        "note": "index 2"
      },
      {
        "label": "o",
        "size": 1,
        "note": "index 3"
      }
    ],
    "note": "A rune is a Unicode code point, not always a complete grapheme cluster. The second byte of é is not another rune start.",
    "description": "Why do range indices jump from 0 to 2? éGo: three runes, four UTF-8 bytes. é uses byte offsets 0 through 1: C3, A9; G uses byte offsets 2: 47; o uses byte offsets 3: 6F. A rune is a Unicode code point, not always a complete grapheme cluster. The second byte of é is not another rune start."
  },
  "scope-and-shadowing": {
    "title": "The inner declaration creates another variable",
    "question": "Why does outer still print 10 after the block prints 3?",
    "kind": "table",
    "headings": [
      "Boundary",
      "Outer value",
      "Inner value"
    ],
    "rows": [
      [
        "Before block",
        "10",
        "not declared"
      ],
      [
        "Inside block after value := 3",
        "10 remains hidden by the inner name",
        "3"
      ],
      [
        "After block",
        "10 visible again",
        "out of scope"
      ]
    ],
    "label": "",
    "links": [],
    "note": "The inner := declares a new variable in the inner block. It does not assign 3 to the outer variable.",
    "description": "Why does outer still print 10 after the block prints 3? Boundary; Outer value; Inner value. Before block; 10; not declared; Inside block after value := 3; 10 remains hidden by the inner name; 3; After block; 10 visible again; out of scope. . . The inner := declares a new variable in the inner block. It does not assign 3 to the outer variable."
  },
  "value-and-pointer": {
    "title": "Copying a value and following a pointer affect different objects",
    "question": "Why does only bumpPointer change the caller’s count?",
    "kind": "panels",
    "panels": [
      {
        "label": "bumpValue(count)",
        "model": {
          "kind": "table",
          "headings": [
            "Object",
            "Before",
            "After local increment"
          ],
          "rows": [
            [
              "Caller count",
              "3",
              "3"
            ],
            [
              "Copied parameter value",
              "3",
              "4; discarded on return"
            ]
          ],
          "label": "",
          "links": []
        }
      },
      {
        "label": "bumpPointer(&count)",
        "model": {
          "kind": "references",
          "states": [
            {
              "label": "Inside the helper",
              "objects": [
                {
                  "label": "Caller count",
                  "value": "3 → 4",
                  "refs": [
                    {
                      "name": "count in main",
                      "edge": "caller variable"
                    },
                    {
                      "name": "value parameter",
                      "edge": "copied address; *value writes here"
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    ],
    "note": "Go still passes the pointer value by value. The copied address reaches the original count; the first helper receives only an independent integer value.",
    "description": "Why does only bumpPointer change the caller’s count? bumpValue(count). Object; Before; After local increment. Caller count; 3; 3; Copied parameter value; 3; 4; discarded on return. . ; bumpPointer(&count). Inside the helper: Caller count contains 3 → 4. count in main caller variable Caller count; value parameter copied address; *value writes here Caller count. Go still passes the pointer value by value. The copied address reaches the original count; the first helper receives only an independent integer value."
  },
  "closures": {
    "title": "Each factory call creates independent retained state",
    "question": "Why do next() calls return 1,2 while other() starts at 1?",
    "kind": "references",
    "states": [
      {
        "label": "After the three printed calls",
        "objects": [
          {
            "label": "First makeCounter call’s count",
            "value": "2",
            "refs": [
              {
                "name": "next closure",
                "edge": "retains this state"
              }
            ]
          },
          {
            "label": "Second makeCounter call’s count",
            "value": "1",
            "refs": [
              {
                "name": "other closure",
                "edge": "retains a different state"
              }
            ]
          }
        ]
      }
    ],
    "note": "The returned function keeps access to its captured count after makeCounter returns. This is logical retained state, not a guarantee about stack versus heap placement.",
    "description": "Why do next() calls return 1,2 while other() starts at 1? After the three printed calls: First makeCounter call’s count contains 2. next closure retains this state First makeCounter call’s count; Second makeCounter call’s count contains 1. other closure retains a different state Second makeCounter call’s count. The returned function keeps access to its captured count after makeCounter returns. This is logical retained state, not a guarantee about stack versus heap placement."
  },
  "slice-bounds": {
    "title": "A slice is a view of an exclusive-stop interval",
    "question": "Why does values[1:3] have length 2 and values [4,6]?",
    "kind": "slots",
    "rows": [
      {
        "label": "Backing elements",
        "values": [
          2,
          4,
          6,
          8
        ],
        "note": "The view includes original indices 1 and 2; index 3 is excluded.",
        "active": [
          1,
          2
        ],
        "muted": [
          0,
          3
        ],
        "tags": {
          "1": "start",
          "3": "stop"
        }
      }
    ],
    "note": "The new slice indexes its selected elements from 0, so middle[0] reaches values[1]. Slicing does not copy these int elements.",
    "description": "Why does values[1:3] have length 2 and values [4,6]? Backing elements: index 0 = 2, index 1 = 4, index 2 = 6, index 3 = 8. The view includes original indices 1 and 2; index 3 is excluded.. The new slice indexes its selected elements from 0, so middle[0] reaches values[1]. Slicing does not copy these int elements."
  },
  "struct-values": {
    "title": "A struct assignment copies these value fields",
    "question": "Why is original still {2,3} after moved.X=9?",
    "kind": "table",
    "headings": [
      "Independent struct",
      "X",
      "Y"
    ],
    "rows": [
      [
        "point (original)",
        "2",
        "3"
      ],
      [
        "moved (copied then edited)",
        "9",
        "3"
      ]
    ],
    "label": "",
    "links": [],
    "note": "Point contains int fields, so changing moved.X does not modify point.X. Struct fields that are slices, maps or pointers can still refer to shared objects; this is not a universal deep copy.",
    "description": "Why is original still {2,3} after moved.X=9? Independent struct; X; Y. point (original); 2; 3; moved (copied then edited); 9; 3. . . Point contains int fields, so changing moved.X does not modify point.X. Struct fields that are slices, maps or pointers can still refer to shared objects; this is not a universal deep copy."
  },
  "channel-handoff": {
    "title": "An unbuffered send meets a receive",
    "question": "Why can the send of 7 complete only with a receiver?",
    "kind": "table",
    "headings": [
      "Sender goroutine",
      "Channel",
      "main"
    ],
    "rows": [
      [
        "values <- 7",
        "Unbuffered: no queued slot",
        "<-values receives 7"
      ],
      [
        "Send completes after the handoff",
        "Communication pairs the operations",
        "Print received 7"
      ]
    ],
    "label": "",
    "links": [],
    "note": "No buffer occupancy is implied. The diagram is a synchronization dependency, not a measurement of which CPU runs first.",
    "description": "Why can the send of 7 complete only with a receiver? Sender goroutine; Channel; main. values <- 7; Unbuffered: no queued slot; <-values receives 7; Send completes after the handoff; Communication pairs the operations; Print received 7. . . No buffer occupancy is implied. The diagram is a synchronization dependency, not a measurement of which CPU runs first."
  },
  "close-and-range": {
    "title": "The producer closes only after its final send",
    "question": "Why does range finish with sum 6?",
    "kind": "flow",
    "steps": [
      {
        "label": "Producer sends 1,2,3",
        "detail": "main receives each handoff and accumulates 1+2+3."
      },
      {
        "label": "Producer returns",
        "detail": "Its deferred close(jobs) runs after all three sends complete."
      },
      {
        "label": "main range observes closed and drained",
        "detail": "The loop ends; print sum 6."
      }
    ],
    "note": "jobs is unbuffered in this starter. Closing marks the end of sends; it does not create another data value for range or require main to close the channel.",
    "description": "Why does range finish with sum 6? Producer sends 1,2,3. main receives each handoff and accumulates 1+2+3.; Producer returns. Its deferred close(jobs) runs after all three sends complete.; main range observes closed and drained. The loop ends; print sum 6.. jobs is unbuffered in this starter. Closing marks the end of sends; it does not create another data value for range or require main to close the channel."
  },
  "context-cancel": {
    "title": "Cancellation is a signal, not completion by itself",
    "question": "What confirms the worker has observed cancellation?",
    "kind": "table",
    "headings": [
      "Dependency",
      "main",
      "Worker"
    ],
    "rows": [
      [
        "1",
        "cancel() closes the context signal",
        "Waits on ctx.Done()"
      ],
      [
        "2",
        "Receive from stopped",
        "Observes cancellation; sends the message"
      ],
      [
        "3",
        "Print cancelled context canceled",
        "The send has synchronized with main"
      ]
    ],
    "label": "Signal → observation → acknowledgement",
    "links": [],
    "note": "The stopped channel acknowledges this worker’s progress. Calling cancel alone does not join arbitrary goroutines or forcibly stop their instructions.",
    "description": "What confirms the worker has observed cancellation? Dependency; main; Worker. 1; cancel() closes the context signal; Waits on ctx.Done(); 2; Receive from stopped; Observes cancellation; sends the message; 3; Print cancelled context canceled; The send has synchronized with main. Signal → observation → acknowledgement. . The stopped channel acknowledges this worker’s progress. Calling cancel alone does not join arbitrary goroutines or forcibly stop their instructions."
  },
  "pipeline-shutdown": {
    "title": "Stop an upstream sender after taking only one result",
    "question": "Why must main wait for done before reporting producer stopped?",
    "kind": "flow",
    "steps": [
      {
        "label": "main receives first value 1",
        "detail": "The producer may attempt its next send."
      },
      {
        "label": "main calls cancel()",
        "detail": "The producer’s select can choose ctx.Done and return."
      },
      {
        "label": "Producer runs deferred closes",
        "detail": "close(values), then close(done), in reverse defer-registration order."
      },
      {
        "label": "main receives from done",
        "detail": "Only now print producer stopped."
      }
    ],
    "note": "The completion channel prevents treating a cancellation request as proof of exit. The producer must select cancellation while sending, or it could remain blocked on an unwanted second value.",
    "description": "Why must main wait for done before reporting producer stopped? main receives first value 1. The producer may attempt its next send.; main calls cancel(). The producer’s select can choose ctx.Done and return.; Producer runs deferred closes. close(values), then close(done), in reverse defer-registration order.; main receives from done. Only now print producer stopped.. The completion channel prevents treating a cancellation request as proof of exit. The producer must select cancellation while sending, or it could remain blocked on an unwanted second value."
  },
  "mutex-counter": {
    "title": "The lock covers the whole read-modify-write",
    "question": "Why do two workers reliably produce count 200?",
    "kind": "table",
    "headings": [
      "Critical-section boundary",
      "Worker action",
      "Competing worker"
    ],
    "rows": [
      [
        "Lock held",
        "Read count → add 1 → write count",
        "Must wait before its own update"
      ],
      [
        "Unlock",
        "Leave the complete update",
        "May acquire and update"
      ],
      [
        "Both workers Done; Wait returns",
        "main reads final count=200",
        "No worker update remains"
      ]
    ],
    "label": "Two workers × 100 protected increments",
    "links": [],
    "note": "Every participating access follows the same mutex rule. Individual reads and writes without the complete protected increment would not preserve all updates.",
    "description": "Why do two workers reliably produce count 200? Critical-section boundary; Worker action; Competing worker. Lock held; Read count → add 1 → write count; Must wait before its own update; Unlock; Leave the complete update; May acquire and update; Both workers Done; Wait returns; main reads final count=200; No worker update remains. Two workers × 100 protected increments. . Every participating access follows the same mutex rule. Individual reads and writes without the complete protected increment would not preserve all updates."
  },
  "hash-collisions": {
    "title": "Equal bucket indexes do not mean equal keys",
    "question": "Why can Ada and Bob coexist in bucket 1?",
    "kind": "table",
    "headings": [
      "Key",
      "Hash destination len(key)%2",
      "Stored pair"
    ],
    "rows": [
      [
        "Ada",
        "3%2=1",
        "Ada → 3"
      ],
      [
        "Bob",
        "3%2=1",
        "Bob → 8"
      ],
      [
        "get(Bob)",
        "Inspect both keys in bucket 1",
        "Match Bob; return 8,true"
      ]
    ],
    "label": "",
    "links": [],
    "note": "The teaching hash groups these two three-byte ASCII keys into one bucket. Actual key equality selects the entry; a collision is not a duplicate key.",
    "description": "Why can Ada and Bob coexist in bucket 1? Key; Hash destination len(key)%2; Stored pair. Ada; 3%2=1; Ada → 3; Bob; 3%2=1; Bob → 8; get(Bob); Inspect both keys in bucket 1; Match Bob; return 8,true. . . The teaching hash groups these two three-byte ASCII keys into one bucket. Actual key equality selects the entry; a collision is not a duplicate key."
  },
  "search-tree": {
    "title": "In-order follows left, node, right",
    "question": "Why does the traversal print [2,4,6]?",
    "kind": "graph",
    "nodes": [
      {
        "id": "4",
        "label": "4",
        "x": 50,
        "y": 20
      },
      {
        "id": "2",
        "label": "2",
        "x": 22,
        "y": 80
      },
      {
        "id": "6",
        "label": "6",
        "x": 78,
        "y": 80
      }
    ],
    "edges": [
      {
        "from": "4",
        "to": "2",
        "label": "< 4"
      },
      {
        "from": "4",
        "to": "6",
        "label": "> 4"
      }
    ],
    "legend": "The starter inserts 4,2,6. Visit left 2 → root 4 → right 6.",
    "height": 300,
    "note": "The invariant applies to entire subtrees. This small tree happens to be balanced; the basic insertion helper does not guarantee balancing for arbitrary input order.",
    "description": "Why does the traversal print [2,4,6]? Nodes: 4, 2, 6. Connections: 4 leads to 2 (< 4); 4 leads to 6 (> 4). The starter inserts 4,2,6. Visit left 2 → root 4 → right 6.. The invariant applies to entire subtrees. This small tree happens to be balanced; the basic insertion helper does not guarantee balancing for arbitrary input order."
  },
  "minimum-heap": {
    "title": "The minimum is at the root",
    "question": "Why does heap.Pop return 2 and leave length 2?",
    "kind": "graph",
    "nodes": [
      {
        "id": "2",
        "label": "2",
        "x": 50,
        "y": 20
      },
      {
        "id": "4",
        "label": "4",
        "x": 22,
        "y": 80
      },
      {
        "id": "6",
        "label": "6",
        "x": 78,
        "y": 80
      }
    ],
    "edges": [
      {
        "from": "2",
        "to": "4",
        "label": "≤"
      },
      {
        "from": "2",
        "to": "6",
        "label": "≤"
      }
    ],
    "legend": "After heap.Init([4,2,6]), the heap array is [2,4,6]. Pop removes root 2 and repairs the remaining heap.",
    "height": 300,
    "note": "Parent order is a partial order; a heap is not a fully sorted array. The Pop method on the storage type is called as part of the container/heap protocol, not as a standalone minimum operation.",
    "description": "Why does heap.Pop return 2 and leave length 2? Nodes: 2, 4, 6. Connections: 2 leads to 4 (≤); 2 leads to 6 (≤). After heap.Init([4,2,6]), the heap array is [2,4,6]. Pop removes root 2 and repairs the remaining heap.. Parent order is a partial order; a heap is not a fully sorted array. The Pop method on the storage type is called as part of the container/heap protocol, not as a standalone minimum operation."
  },
  "binary-search": {
    "title": "Only candidate bounds change",
    "question": "Why is 11 found at original index 5 after 3 checks?",
    "kind": "slots",
    "rows": [
      {
        "label": "[0,8)",
        "values": [
          1,
          3,
          5,
          7,
          9,
          11,
          13,
          15
        ],
        "note": "9 < 11 → low=5.",
        "active": [
          0,
          1,
          2,
          3,
          4,
          5,
          6,
          7
        ],
        "muted": [],
        "tags": {
          "4": "mid"
        }
      },
      {
        "label": "[5,8)",
        "values": [
          1,
          3,
          5,
          7,
          9,
          11,
          13,
          15
        ],
        "note": "13 > 11 → high=6.",
        "active": [
          5,
          6,
          7
        ],
        "muted": [
          0,
          1,
          2,
          3,
          4
        ],
        "tags": {
          "6": "mid"
        }
      },
      {
        "label": "[5,6)",
        "values": [
          1,
          3,
          5,
          7,
          9,
          11,
          13,
          15
        ],
        "note": "11 matches; return index=5, checks=3.",
        "active": [
          5
        ],
        "muted": [
          0,
          1,
          2,
          3,
          4,
          6,
          7
        ],
        "tags": {
          "5": "mid"
        }
      }
    ],
    "note": "This equality search returns immediately on a match. Unlike lower bound, it does not continue toward the first equal element; the input must be sorted.",
    "description": "Why is 11 found at original index 5 after 3 checks? [0,8): index 0 = 1, index 1 = 3, index 2 = 5, index 3 = 7, index 4 = 9, index 5 = 11, index 6 = 13, index 7 = 15. 9 < 11 → low=5.. [5,8): index 0 = 1, index 1 = 3, index 2 = 5, index 3 = 7, index 4 = 9, index 5 = 11, index 6 = 13, index 7 = 15. 13 > 11 → high=6.. [5,6): index 0 = 1, index 1 = 3, index 2 = 5, index 3 = 7, index 4 = 9, index 5 = 11, index 6 = 13, index 7 = 15. 11 matches; return index=5, checks=3.. This equality search returns immediately on a match. Unlike lower bound, it does not continue toward the first equal element; the input must be sorted."
  },
  "breadth-first-search": {
    "title": "Mark a shared destination when first discovered",
    "question": "Why does D appear once even though B and C both lead to it?",
    "kind": "graph",
    "nodes": [
      {
        "id": "A",
        "label": "A",
        "x": 50,
        "y": 15
      },
      {
        "id": "B",
        "label": "B",
        "x": 20,
        "y": 50
      },
      {
        "id": "C",
        "label": "C",
        "x": 80,
        "y": 50
      },
      {
        "id": "D",
        "label": "D",
        "x": 50,
        "y": 85
      }
    ],
    "edges": [
      {
        "from": "A",
        "to": "B",
        "label": ""
      },
      {
        "from": "A",
        "to": "C",
        "label": ""
      },
      {
        "from": "B",
        "to": "D",
        "label": ""
      },
      {
        "from": "C",
        "to": "D",
        "label": ""
      }
    ],
    "legend": "FIFO visits A, B, C, D. D is marked when first enqueued, so the second path does not add it again.",
    "height": 300,
    "note": "These are directed adjacency lists. This BFS order depends on the supplied neighbor slice order, not map iteration order.",
    "description": "Why does D appear once even though B and C both lead to it? Nodes: A, B, C, D. Connections: A leads to B; A leads to C; B leads to D; C leads to D. FIFO visits A, B, C, D. D is marked when first enqueued, so the second path does not add it again.. These are directed adjacency lists. This BFS order depends on the supplied neighbor slice order, not map iteration order."
  },
  "topological-order": {
    "title": "A dependency must precede its successor",
    "question": "Why is [0,1,2] a complete order?",
    "kind": "graph",
    "nodes": [
      {
        "id": "0",
        "label": "0",
        "x": 16,
        "y": 50
      },
      {
        "id": "1",
        "label": "1",
        "x": 50,
        "y": 50
      },
      {
        "id": "2",
        "label": "2",
        "x": 84,
        "y": 50
      }
    ],
    "edges": [
      {
        "from": "0",
        "to": "1",
        "label": ""
      },
      {
        "from": "1",
        "to": "2",
        "label": ""
      }
    ],
    "legend": "Initial indegrees are [0,1,1]. Each chosen vertex releases the next one.",
    "height": 180,
    "note": "A cycle would leave no unused zero-indegree vertex before all vertices were emitted, returning complete=false. This is precedence, not a time or distance measurement.",
    "description": "Why is [0,1,2] a complete order? Nodes: 0, 1, 2. Connections: 0 leads to 1 (before); 1 leads to 2 (before). Initial indegrees are [0,1,1]. Each chosen vertex releases the next one.. A cycle would leave no unused zero-indegree vertex before all vertices were emitted, returning complete=false. This is precedence, not a time or distance measurement."
  },
  "db-update": {
    "title": "The updated snapshot owns different row state",
    "question": "Why does the old score stay 42 when next has score 60?",
    "kind": "references",
    "states": [
      {
        "label": "After the successful update",
        "objects": [
          {
            "label": "Old snapshot row",
            "value": "7 | Ada | 42",
            "refs": [
              {
                "name": "db",
                "edge": "keeps the original snapshot"
              }
            ]
          },
          {
            "label": "New snapshot row",
            "value": "7 | Ada | 60",
            "refs": [
              {
                "name": "next",
                "edge": "contains the updated candidate"
              }
            ]
          }
        ]
      }
    ],
    "note": "The store API returns a new snapshot rather than mutating the old one. This is the API’s row-copy policy, not the ordinary behavior of every Go slice assignment.",
    "description": "Why does the old score stay 42 when next has score 60? After the successful update: Old snapshot row contains 7 | Ada | 42. db keeps the original snapshot Old snapshot row; New snapshot row contains 7 | Ada | 60. next contains the updated candidate New snapshot row. The store API returns a new snapshot rather than mutating the old one. This is the API’s row-copy policy, not the ordinary behavior of every Go slice assignment."
  },
  "db-transaction": {
    "title": "A later failure discards the whole candidate",
    "question": "Why does the returned snapshot still have score 42 and one row?",
    "kind": "table",
    "headings": [
      "Step",
      "Private work",
      "Published / returned state"
    ],
    "rows": [
      [
        "Begin from old snapshot",
        "ID7 Ada score42",
        "Old snapshot unchanged"
      ],
      [
        "Update ID7 to score60",
        "Candidate score60",
        "Old snapshot unchanged"
      ],
      [
        "Insert duplicate ID7",
        "Error: duplicate primary key",
        "Discard candidate"
      ],
      [
        "Transaction returns error",
        "No candidate publication",
        "score42; rows1; rolled back=true"
      ]
    ],
    "label": "",
    "links": [],
    "note": "The successful intermediate update is not published separately. All-or-nothing behavior belongs to this store.Transaction contract; it is not automatically supplied by a callback.",
    "description": "Why does the returned snapshot still have score 42 and one row? Step; Private work; Published / returned state. Begin from old snapshot; ID7 Ada score42; Old snapshot unchanged; Update ID7 to score60; Candidate score60; Old snapshot unchanged; Insert duplicate ID7; Error: duplicate primary key; Discard candidate; Transaction returns error; No candidate publication; score42; rows1; rolled back=true. . . The successful intermediate update is not published separately. All-or-nothing behavior belongs to this store.Transaction contract; it is not automatically supplied by a callback."
  }
};
