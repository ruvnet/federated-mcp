{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
        "Annotated": {
            "description": "Base for objects that include optional annotations for the client. The client can use annotations to inform how objects are used or displayed",
            "properties": {
                "annotations": {
                    "properties": {
                        "audience": {
                            "description": "Describes who the intended customer of this object or data is.\n\nIt can include multiple entries to indicate content useful for multiple audiences (e.g., `[\"user\", \"assistant\"]`).",
                            "items": {
                                "$ref": "#/definitions/Role"
                            },
                            "type": "array"
                        },
                        "priority": {
                            "description": "Describes how important this data is for operating the server.\n\nA value of 1 means \"most important,\" and indicates that the data is\neffectively required, while 0 means \"least important,\" and indicates that\nthe data is entirely optional.",
                            "maximum": 1,
                            "minimum": 0,
                            "type": "number"
                        }
                    },
                    "type": "object"
                }
            },
            "type": "object"
        },
        "BlobResourceContents": {
            "properties": {
                "blob": {
                    "description": "A base64-encoded string representing the binary data of the item.",
                    "format": "byte",
                    "type": "string"
                },
                "mimeType": {
                    "description": "The MIME type of this resource, if known.",
                    "type": "string"
                },
                "uri": {
                    "description": "The URI of this resource.",
                    "format": "uri",
                    "type": "string"
                }
            },
            "required": [
                "blob",
                "uri"
            ],
            "type": "object"
        },
        "CallToolRequest": {
            "description": "Used by the client to invoke a tool provided by the server.",
            "properties": {
                "method": {
                    "const": "tools/call",
                    "type": "string"
                },
                "params": {
                    "properties": {
                        "arguments": {
                            "additionalProperties": {},
                            "type": "object"
                        },
                        "name": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "name"
                    ],
                    "type": "object"
                }
            },
            "required": [
                "method",
                "params"
            ],
            "type": "object"
        },
        "CallToolResult": {
            "description": "The server's response to a tool call.\n\nAny errors that originate from the tool SHOULD be reported inside the result\nobject, with `isError` set to true, _not_ as an MCP protocol-level error\nresponse. Otherwise, the LLM would not be able to see that an error occurred\nand self-correct.\n\nHowever, any errors in _finding_ the tool, an error indicating that the\nserver does not support tool calls, or any other exceptional conditions,\nshould be reported as an MCP error response.",
            "properties": {
                "_meta": {
                    "additionalProperties": {},
                    "description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
                    "type": "object"
                },
                "content": {
                    "items": {
                        "anyOf": [
                            {
                                "$ref": "#/definitions/TextContent"
                            },
                            {
                                "$ref": "#/definitions/ImageContent"
                            },
                            {
                                "$ref": "#/definitions/EmbeddedResource"
                            }
                        ]
                    },
                    "type": "array"
                },
                "isError": {
                    "description": "Whether the tool call ended in an error.\n\nIf not set, this is assumed to be false (the call was successful).",
                    "type": "boolean"
                }
            },
            "required": [
                "content"
            ],
            "type": "object"
        },
        "CancelledNotification": {
            "description": "This notification can be sent by either side to indicate that it is cancelling a previously-issued request.\n\nThe request SHOULD still be in-flight, but due to communication latency, it is always possible that this notification MAY arrive after the request has already finished.\n\nThis notification indicates that the result will be unused, so any associated processing SHOULD cease.\n\nA client MUST NOT attempt to cancel its `initialize` request.",
            "properties": {
                "method": {
                    "const": "notifications/cancelled",
                    "type": "string"
                },
                "params": {
                    "properties": {
                        "reason": {
                            "description": "An optional string describing the reason for the cancellation. This MAY be logged or presented to the user.",
                            "type": "string"
                        },
                        "requestId": {
                            "$ref": "#/definitions/RequestId",
                            "description": "The ID of the request to cancel.\n\nThis MUST correspond to the ID of a request previously issued in the same direction."
                        }
                    },
                    "required": [
                        "requestId"
                    ],
                    "type": "object"
                }
            },
            "required": [
                "method",
                "params"
            ],
            "type": "object"
        },
        "ClientCapabilities": {
            "description": "Capabilities a client may support. Known capabilities are defined here, in this schema, but this is not a closed set: any client can define its own, additional capabilities.",
            "properties": {
                "experimental": {
                    "additionalProperties": {
                        "additionalProperties": true,
                        "properties": {},
                        "type": "object"
                    },
                    "description": "Experimental, non-standard capabilities that the client supports.",
                    "type": "object"
                },
                "roots": {
                    "description": "Present if the client supports listing roots.",
                    "properties": {
                        "listChanged": {
                            "description": "Whether the client supports notifications for changes to the roots list.",
                            "type": "boolean"
                        }
                    },
                    "type": "object"
                },
                "sampling": {
                    "additionalProperties": true,
                    "description": "Present if the client supports sampling from an LLM.",
                    "properties": {},
                    "type": "object"
                }
            },
            "type": "object"
        },
        "ClientNotification": {
            "anyOf": [
                {
                    "$ref": "#/definitions/CancelledNotification"
                },
                {
                    "$ref": "#/definitions/InitializedNotification"
                },
                {
                    "$ref": "#/definitions/ProgressNotification"
                },
                {
                    "$ref": "#/definitions/RootsListChangedNotification"
                }
            ]
        },
        "ClientRequest": {
            "anyOf": [
                {
                    "$ref": "#/definitions/InitializeRequest"
                },
                {
                    "$ref": "#/definitions/PingRequest"
                },
                {
                    "$ref": "#/definitions/ListResourcesRequest"
                },
                {
                    "$ref": "#/definitions/ReadResourceRequest"
                },
                {
                    "$ref": "#/definitions/SubscribeRequest"
                },
                {
                    "$ref": "#/definitions/UnsubscribeRequest"
                },
                {
                    "$ref": "#/definitions/ListPromptsRequest"
                },
                {
                    "$ref": "#/definitions/GetPromptRequest"
                },
                {
                    "$ref": "#/definitions/ListToolsRequest"
                },
                {
                    "$ref": "#/definitions/CallToolRequest"
                },
                {
                    "$ref": "#/definitions/SetLevelRequest"
                },
                {
                    "$ref": "#/definitions/CompleteRequest"
                }
            ]
        },
        "ClientResult": {
            "anyOf": [
                {
                    "$ref": "#/definitions/Result"
                },
                {
                    "$ref": "#/definitions/CreateMessageResult"
                },
                {
                    "$ref": "#/definitions/ListRootsResult"
                }
            ]
        },
        "CompleteRequest": {
            "description": "A request from the client to the server, to ask for completion options.",
            "properties": {
                "method": {
                    "const": "completion/complete",
                    "type": "string"
                },
                "params": {
                    "properties": {
                        "argument": {
                            "description": "The argument's information",
                            "properties": {
                                "name": {
                                    "description": "The name of the argument",
                                    "type": "string"
                                },
                                "value": {
                                    "description": "The value of the argument to use for completion matching.",
                                    "type": "string"
                                }
                            },
                            "required": [
                                "name",
                                "value"
                            ],
                            "type": "object"
                        },
                        "ref": {
                            "anyOf": [
                                {
                                    "$ref": "#/definitions/PromptReference"
                                },
                                {
                                    "$ref": "#/definitions/ResourceReference"
                                }
                            ]
                        }
                    },
                    "required": [
                        "argument",
                        "ref"
                    ],
                    "type": "object"
                }
            },
            "required": [
                "method",
                "params"
            ],
            "type": "object"
        },
        "CompleteResult": {
            "description": "The server's response to a completion/complete request",
            "properties": {
                "_meta": {
                    "additionalProperties": {},
                    "description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
                    "type": "object"
                },
                "completion": {
                    "properties": {
                        "hasMore": {
                            "description": "Indicates whether there are additional completion options beyond those provided in the current response, even if the exact total is unknown.",
                            "type": "boolean"
                        },
                        "total": {
                            "description": "The total number of completion options available. This can exceed the number of values actually sent in the response.",
                            "type": "integer"
                        },
                        "values": {
                            "description": "An array of completion values. Must not exceed 100 items.",
                            "items": {
                                "type": "string"
                            },
                            "type": "array"
                        }
                    },
                    "required": [
                        "values"
                    ],
                    "type": "object"
                }
            },
            "required": [
                "completion"
            ],
            "type": "object"
        },
        "CreateMessageRequest": {
            "description": "A request from the server to sample an LLM via the client. The client has full discretion over which model to select. The client should also inform the user before beginning sampling, to allow them to inspect the request (human in the loop) and decide whether to approve it.",
            "properties": {
                "method": {
                    "const": "sampling/createMessage",
                    "type": "string"
                },
                "params": {
                    "properties": {
                        "includeContext": {
                            "description": "A request to include context from one or more MCP servers (including the caller), to be attached to the prompt. The client MAY ignore this request.",
                            "enum": [
                                "allServers",
                                "none",
                                "thisServer"
                            ],
                            "type": "string"
                        },
                        "maxTokens": {
                            "description": "The maximum number of tokens to sample, as requested by the server. The client MAY choose to sample fewer tokens than requested.",
                            "type": "integer"
                        },
                        "messages": {
                            "items": {
                                "$ref": "#/definitions/SamplingMessage"
                            },
                            "type": "array"
                        },
                        "metadata": {
                            "additionalProperties": true,
                            "description": "Optional metadata to pass through to the LLM provider. The format of this metadata is provider-specific.",
                            "properties": {},
                            "type": "object"
                        },
                        "modelPreferences": {
                            "$ref": "#/definitions/ModelPreferences",
                            "description": "The server's preferences for which model to select. The client MAY ignore these preferences."
                        },
                        "stopSequences": {
                            "items": {
                                "type": "string"
                            },
                            "type": "array"
                        },
                        "systemPrompt": {
                            "description": "An optional system prompt the server wants to use for sampling. The client MAY modify or omit this prompt.",
                            "type": "string"
                        },
                        "temperature": {
                            "type": "number"
                        }
                    },
                    "required": [
                        "maxTokens",
                        "messages"
                    ],
                    "type": "object"
                }
            },
            "required": [
                "method",
                "params"
            ],
            "type": "object"
        },
        "CreateMessageResult": {
            "description": "The client's response to a sampling/create_message request from the server. The client should inform the user before returning the sampled message, to allow them to inspect the response (human in the loop) and decide whether to allow the server to see it.",
            "properties": {
                "_meta": {
                    "additionalProperties": {},
                    "description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
                    "type": "object"
                },
                "content": {
                    "anyOf": [
                        {
                            "$ref": "#/definitions/TextContent"
                        },
                        {
                            "$ref": "#/definitions/ImageContent"
                        }
                    ]
                },
                "model": {
                    "description": "The name of the model that generated the message.",
                    "type": "string"
                },
                "role": {
                    "$ref": "#/definitions/Role"
                },
                "stopReason": {
                    "description": "The reason why sampling stopped, if known.",
                    "type": "string"
                }
            },
            "required": [
                "content",
                "model",
                "role"
            ],
            "type": "object"
        },
        "Cursor": {
            "description": "An opaque token used to represent a cursor for pagination.",
            "type": "string"
        },
        "EmbeddedResource": {
            "description": "The contents of a resource, embedded into a prompt or tool call result.\n\nIt is up to the client how best to render embedded resources for the benefit\nof the LLM and/or the user.",
            "properties": {
                "annotations": {
                    "properties": {
                        "audience": {
                            "description": "Describes who the intended customer of this object or data is.\n\nIt can include multiple entries to indicate content useful for multiple audiences (e.g., `[\"user\", \"assistant\"]`).",
                            "items": {
                                "$ref": "#/definitions/Role"
                            },
                            "type": "array"
                        },
                        "priority": {
                            "description": "Describes how important this data is for operating the server.\n\nA value of 1 means \"most important,\" and indicates that the data is\neffectively required, while 0 means \"least important,\" and indicates that\nthe data is entirely optional.",
                            "maximum": 1,
                            "minimum": 0,
                            "type": "number"
                        }
                    },
                    "type": "object"
                },
                "resource": {
                    "anyOf": [
                        {
                            "$ref": "#/definitions/TextResourceContents"
                        },
                        {
                            "$ref": "#/definitions/BlobResourceContents"
                        }
                    ]
                },
                "type": {
                    "const": "resource",
                    "type": "string"
                }
            },
            "required": [
                "resource",
                "type"
            ],
            "type": "object"
        },
        "EmptyResult": {
            "$ref": "#/definitions/Result"
        },
        "GetPromptRequest": {
            "description": "Used by the client to get a prompt provided by the server.",
            "properties": {
                "method": {
                    "const": "prompts/get",
                    "type": "string"
                },
                "params": {
                    "properties": {
                        "arguments": {
                            "additionalProperties": {
                                "type": "string"
                            },
                            "description": "Arguments to use for templating the prompt.",
                            "type": "object"
                        },
                        "name": {
                            "description": "The name of the prompt or prompt template.",
                            "type": "string"
                        }
                    },
                    "required": [
                        "name"
                    ],
                    "type": "object"
                }
            },
            "required": [
                "method",
                "params"
            ],
            "type": "object"
        },
        "GetPromptResult": {
            "description": "The server's response to a prompts/get request from the client.",
            "properties": {
                "_meta": {
                    "additionalProperties": {},
                    "description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
                    "type": "object"
                },
                "description": {
                    "description": "An optional description for the prompt.",
                    "type": "string"
                },
                "messages": {
                    "items": {
                        "$ref": "#/definitions/PromptMessage"
                    },
                    "type": "array"
                }
            },
            "required": [
                "messages"
            ],
            "type": "object"
        },
        "ImageContent": {
            "description": "An image provided to or from an LLM.",
            "properties": {
                "annotations": {
                    "properties": {
                        "audience": {
                            "description": "Describes who the intended customer of this object or data is.\n\nIt can include multiple entries to indicate content useful for multiple audiences (e.g., `[\"user\", \"assistant\"]`).",
                            "items": {
                                "$ref": "#/definitions/Role"
                            },
                            "type": "array"
                        },
                        "priority": {
                            "description": "Describes how important this data is for operating the server.\n\nA value of 1 means \"most important,\" and indicates that the data is\neffectively required, while 0 means \"least important,\" and indicates that\nthe data is entirely optional.",
                            "maximum": 1,
                            "minimum": 0,
                            "type": "number"
                        }
                    },
                    "type": "object"
                },
                "data": {
                    "description": "The base64-encoded image data.",
                    "format": "byte",
                    "type": "string"
                },
                "mimeType": {
                    "description": "The MIME type of the image. Different providers may support different image types.",
                    "type": "string"
                },
                "type": {
                    "const": "image",
                    "type": "string"
                }
            },
            "required": [
                "data",
                "mimeType",
                "type"
            ],
            "type": "object"
        },
        "Implementation": {
            "description": "Describes the name and version of an MCP implementation.",
            "properties": {
                "name": {
                    "type": "string"
                },
                "version": {
                    "type": "string"
                }
            },
            "required": [
                "name",
                "version"
            ],
            "type": "object"
        },
        "InitializeRequest": {
            "description": "This request is sent from the client to the server when it first connects, asking it to begin initialization.",
            "properties": {
                "method": {
                    "const": "initialize",
                    "type": "string"
                },
                "params": {
                    "properties": {
                        "capabilities": {
                            "$ref": "#/definitions/ClientCapabilities"
                        },
                        "clientInfo": {
                            "$ref": "#/definitions/Implementation"
                        },
                        "protocolVersion": {
                            "description": "The latest version of the Model Context Protocol that the client supports. The client MAY decide to support older versions as well.",
                            "type": "string"
                        }
                    },
                    "required": [
                        "capabilities",
                        "clientInfo",
                        "protocolVersion"
                    ],
                    "type": "object"
                }
            },
            "required": [
                "method",
                "params"
            ],
            "type": "object"
        },
        "InitializeResult": {
            "description": "After receiving an initialize request from the client, the server sends this response.",
            "properties": {
                "_meta": {
                    "additionalProperties": {},
                    "description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
                    "type": "object"
                },
                "capabilities": {
                    "$ref": "#/definitions/ServerCapabilities"
                },
                "instructions": {
                    "description": "Instructions describing how to use the server and its features.\n\nThis can be used by clients to improve the LLM's understanding of available tools, resources, etc. It can be thought of like a \"hint\" to the model. For example, this information MAY be added to the system prompt.",
                    "type": "string"
                },
                "protocolVersion": {
                    "description": "The version of the Model Context Protocol that the server wants to use. This may not match the version that the client requested. If the client cannot support this version, it MUST disconnect.",
                    "type": "string"
                },
                "serverInfo": {
                    "$ref": "#/definitions/Implementation"
                }
            },
            "required": [
                "capabilities",
                "protocolVersion",
                "serverInfo"
            ],
            "type": "object"
        },
        "InitializedNotification": {
            "description": "This notification is sent from the client to the server after initialization has finished.",
            "properties": {
                "method": {
                    "const": "notifications/initialized",
                    "type": "string"
                },
                "params": {
                    "additionalProperties": {},
                    "properties": {
                        "_meta": {
                            "additionalProperties": {},
                            "description": "This parameter name is reserved by MCP to allow clients and servers to attach additional metadata to their notifications.",
                            "type": "object"
                        }
                    },
                    "type": "object"
                }
            },
            "required": [
                "method"
            ],
            "type": "object"
        },
        "JSONRPCError": {
            "description": "A response to a request that indicates an error occurred.",
            "properties": {
                "error": {
                    "properties": {
                        "code": {
                            "description": "The error type that occurred.",
                            "type": "integer"
                        },
                        "data": {
                            "description": "Additional information about the error. The value of this member is defined by the sender (e.g. detailed error information, nested errors etc.)."
                        },
                        "message": {
                            "description": "A short description of the error. The message SHOULD be limited to a concise single sentence.",
                            "type": "string"
                        }
                    },
                    "required": [
                        "code",
                        "message"
                    ],
                    "type": "object"
                },
                "id": {
                    "$ref": "#/definitions/RequestId"
                },
                "jsonrpc": {
                    "const": "2.0",
                    "type": "string"
                }
            },
            "required": [
                "error",
                "id",
                "jsonrpc"
            ],
            "type": "object"
        },
        "JSONRPCMessage": {
            "anyOf": [
                {
                    "$ref": "#/definitions/JSONRPCRequest"
                },
                {
                    "$ref": "#/definitions/JSONRPCNotification"
                },
                {
                    "$ref": "#/definitions/JSONRPCResponse"
                },
                {
                    "$ref": "#/definitions/JSONRPCError"
                }
            ]
        },
        "JSONRPCNotification": {
            "description": "A notification which does not expect a response.",
            "properties": {
                "jsonrpc": {
                    "const": "2.0",
                    "type": "string"
                },
                "method": {
                    "type": "string"
                },
                "params": {
                    "additionalProperties": {},
                    "properties": {
                        "_meta": {
                            "additionalProperties": {},
                            "description": "This parameter name is reserved by MCP to allow clients and servers to attach additional metadata to their notifications.",
                            "type": "object"
                        }
                    },
                    "type": "object"
                }
            },
            "required": [
                "jsonrpc",
                "method"
            ],
            "type": "object"
        },
        "JSONRPCRequest": {
            "description": "A request that expects a response.",
            "properties": {
                "id": {
                    "$ref": "#/definitions/RequestId"
                },
                "jsonrpc": {
                    "const": "2.0",
                    "type": "string"
                },
                "method": {
                    "type": "string"
                },
                "params": {
                    "additionalProperties": {},
                    "properties": {
                        "_meta": {
                            "properties": {
                                "progressToken": {
                                    "$ref": "#/definitions/ProgressToken",
                                    "description": "If specified, the caller is requesting out-of-band progress notifications for this request (as represented by notifications/progress). The value of this parameter is an opaque token that will be attached to any subsequent notifications. The receiver is not obligated to provide these notifications."
                                }
                            },
                            "type": "object"
                        }
                    },
                    "type": "object"
                }
            },
            "required": [
                "id",
                "jsonrpc",
                "method"
            ],
            "type": "object"
        },
        "JSONRPCResponse": {
            "description": "A successful (non-error) response to a request.",
            "properties": {
                "id": {
                    "$ref": "#/definitions/RequestId"
                },
                "jsonrpc": {
                    "const": "2.0",
                    "type": "string"
                },
                "result": {
                    "$ref": "#/definitions/Result"
                }
            },
            "required": [
                "id",
                "jsonrpc",
                "result"
            ],
            "type": "object"
        },
        "ListPromptsRequest": {
            "description": "Sent from the client to request a list of prompts and prompt templates the server has.",
            "properties": {
                "method": {
                    "const": "prompts/list",
                    "type": "string"
                },
                "params": {
                    "properties": {
                        "cursor": {
                            "description": "An opaque token representing the current pagination position.\nIf provided, the server should return results starting after this cursor.",
                            "type": "string"
                        }
                    },
                    "type": "object"
                }
            },
            "required": [
                "method"
            ],
            "type": "object"
        },
        "ListPromptsResult": {
            "description": "The server's response to a prompts/list request from the client.",
            "properties": {
                "_meta": {
                    "additionalProperties": {},
                    "description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
                    "type": "object"
                },
                "nextCursor": {
                    "description": "An opaque token representing the pagination position after the last returned result.\nIf present, there may be more results available.",
                    "type": "string"
                },
                "prompts": {
                    "items": {
                        "$ref": "#/definitions/Prompt"
                    },
                    "type": "array"
                }
            },
            "required": [
                "prompts"
            ],
            "type": "object"
        },
        "ListResourceTemplatesRequest": {
            "description": "Sent from the client to request a list of resource templates the server has.",
            "properties": {
                "method": {
                    "const": "resources/templates/list",
                    "type": "string"
                },
                "params": {
                    "properties": {
                        "cursor": {
                            "description": "An opaque token representing the current pagination position.\nIf provided, the server should return results starting after this cursor.",
                            "type": "string"
                        }
                    },
                    "type": "object"
                }
            },
            "required": [
                "method"
            ],
            "type": "object"
        },
        "ListResourceTemplatesResult": {
            "description": "The server's response to a resources/templates/list request from the client.",
            "properties": {
                "_meta": {
                    "additionalProperties": {},
                    "description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
                    "type": "object"
                },
                "nextCursor": {
                    "description": "An opaque token representing the pagination position after the last returned result.\nIf present, there may be more results available.",
                    "type": "string"
                },
                "resourceTemplates": {
                    "items": {
                        "$ref": "#/definitions/ResourceTemplate"
                    },
                    "type": "array"
                }
            },
            "required": [
                "resourceTemplates"
            ],
            "type": "object"
        },
        "ListResourcesRequest": {
            "description": "Sent from the client to request a list of resources the server has.",
            "properties": {
                "method": {
                    "const": "resources/list",
                    "type": "string"
                },
                "params": {
                    "properties": {
                        "cursor": {
                            "description": "An opaque token representing the current pagination position.\nIf provided, the server should return results starting after this cursor.",
                            "type": "string"
                        }
                    },
                    "type": "object"
                }
            },
            "required": [
                "method"
            ],
            "type": "object"
        },
        "ListResourcesResult": {
            "description": "The server's response to a resources/list request from the client.",
            "properties": {
                "_meta": {
                    "additionalProperties": {},
                    "description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
                    "type": "object"
                },
                "nextCursor": {
                    "description": "An opaque token representing the pagination position after the last returned result.\nIf present, there may be more results available.",
                    "type": "string"
                },
                "resources": {
                    "items": {
                        "$ref": "#/definitions/Resource"
                    },
                    "type": "array"
                }
            },
            "required": [
                "resources"
            ],
            "type": "object"
        },
        "ListRootsRequest": {
            "description": "Sent from the server to request a list of root URIs from the client. Roots allow\nservers to ask for specific directories or files to operate on. A common example\nfor roots is providing a set of repositories or directories a server should operate\non.\n\nThis request is typically used when the server needs to understand the file system\nstructure or access specific locations that the client has permission to read from.",
            "properties": {
                "method": {
                    "const": "roots/list",
                    "type": "string"
                },
                "params": {
                    "additionalProperties": {},
                    "properties": {
                        "_meta": {
                            "properties": {
                                "progressToken": {
                                    "$ref": "#/definitions/ProgressToken",
                                    "description": "If specified, the caller is requesting out-of-band progress notifications for this request (as represented by notifications/progress). The value of this parameter is an opaque token that will be attached to any subsequent notifications. The receiver is not obligated to provide these notifications."
                                }
                            },
                            "type": "object"
                        }
                    },
                    "type": "object"
                }
            },
            "required": [
                "method"
            ],
            "type": "object"
        },
        "ListRootsResult": {
            "description": "The client's response to a roots/list request from the server.\nThis result contains an array of Root objects, each representing a root directory\nor file that the server can operate on.",
            "properties": {
                "_meta": {
                    "additionalProperties": {},
                    "description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
                    "type": "object"
                },
                "roots": {
                    "items": {
                        "$ref": "#/definitions/Root"
                    },
                    "type": "array"
                }
            },
            "required": [
                "roots"
            ],
            "type": "object"
        },
        "ListToolsRequest": {
            "description": "Sent from the client to request a list of tools the server has.",
            "properties": {
                "method": {
                    "const": "tools/list",
                    "type": "string"
                },
                "params": {
                    "properties": {
                        "cursor": {
                            "description": "An opaque token representing the current pagination position.\nIf provided, the server should return results starting after this cursor.",
                            "type": "string"
                        }
                    },
                    "type": "object"
                }
            },
            "required": [
                "method"
            ],
            "type": "object"
        },
        "ListToolsResult": {
            "description": "The server's response to a tools/list request from the client.",
            "properties": {
                "_meta": {
                    "additionalProperties": {},
                    "description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
                    "type": "object"
                },
                "nextCursor": {
                    "description": "An opaque token representing the pagination position after the last returned result.\nIf present, there may be more results available.",
                    "type": "string"
                },
                "tools": {
                    "items": {
                        "$ref": "#/definitions/Tool"
                    },
                    "type": "array"
                }
            },
            "required": [
                "tools"
            ],
            "type": "object"
        },
        "LoggingLevel": {
            "description": "The severity of a log message.\n\nThese map to syslog message severities, as specified in RFC-5424:\nhttps://datatracker.ietf.org/doc/html/rfc5424#section-6.2.1",
            "enum": [
                "alert",
                "critical",
                "debug",
                "emergency",
                "error",
                "info",
                "notice",
                "warning"
            ],
            "type": "string"
        },
        "LoggingMessageNotification": {
            "description": "Notification of a log message passed from server to client. If no logging/setLevel request has been sent from the client, the server MAY decide which messages to send automatically.",
            "properties": {
                "method": {
                    "const": "notifications/message",
                    "type": "string"
                },
                "params": {
                    "properties": {
                        "data": {
                            "description": "The data to be logged, such as a string message or an object. Any JSON serializable type is allowed here."
                        },
                        "level": {
                            "$ref": "#/definitions/LoggingLevel",
                            "description": "The severity of this log message."
                        },
                        "logger": {
                            "description": "An optional name of the logger issuing this message.",
                            "type": "string"
                        }
                    },
                    "required": [
                        "data",
                        "level"
                    ],
                    "type": "object"
                }
            },
            "required": [
                "method",
                "params"
            ],
            "type": "object"
        },
        "ModelHint": {
            "description": "Hints to use for model selection.\n\nKeys not declared here are currently left unspecified by the spec and are up\nto the client to interpret.",
            "properties": {
                "name": {
                    "description": "A hint for a model name.\n\nThe client SHOULD treat this as a substring of a model name; for example:\n - `claude-3-5-sonnet` should match `claude-3-5-sonnet-20241022`\n - `sonnet` should match `claude-3-5-sonnet-20241022`, `claude-3-sonnet-20240229`, etc.\n - `claude` should match any Claude model\n\nThe client MAY also map the string to a different provider's model name or a different model family, as long as it fills a similar niche; for example:\n - `gemini-1.5-flash` could match `claude-3-haiku-20240307`",
                    "type": "string"
                }
            },
            "type": "object"
        },
        "ModelPreferences": {
            "description": "The server's preferences for model selection, requested of the client during sampling.\n\nBecause LLMs can vary along multiple dimensions, choosing the \"best\" model is\nrarely straightforward.  Different models excel in different areas—some are\nfaster but less capable, others are more capable but more expensive, and so\non. This interface allows servers to express their priorities across multiple\ndimensions to help clients make an appropriate selection for their use case.\n\nThese preferences are always advisory. The client MAY ignore them. It is also\nup to the client to decide how to interpret these preferences and how to\nbalance them against other considerations.",
            "properties": {
                "costPriority": {
                    "description": "How much to prioritize cost when selecting a model. A value of 0 means cost\nis not important, while a value of 1 means cost is the most important\nfactor.",
                    "maximum": 1,
                    "minimum": 0,
                    "type": "number"
                },
                "hints": {
                    "description": "Optional hints to use for model selection.\n\nIf multiple hints are specified, the client MUST evaluate them in order\n(such that the first match is taken).\n\nThe client SHOULD prioritize these hints over the numeric priorities, but\nMAY still use the priorities to select from ambiguous matches.",
                    "items": {
                        "$ref": "#/definitions/ModelHint"
                    },
                    "type": "array"
                },
                "intelligencePriority": {
                    "description": "How much to prioritize intelligence and capabilities when selecting a\nmodel. A value of 0 means intelligence is not important, while a value of 1\nmeans intelligence is the most important factor.",
                    "maximum": 1,
                    "minimum": 0,
                    "type": "number"
                },
                "speedPriority": {
                    "description": "How much to prioritize sampling speed (latency) when selecting a model. A\nvalue of 0 means speed is not important, while a value of 1 means speed is\nthe most important factor.",
                    "maximum": 1,
                    "minimum": 0,
                    "type": "number"
                }
            },
            "type": "object"
        },
        "Notification": {
            "properties": {
                "method": {
                    "type": "string"
                },
                "params": {
                    "additionalProperties": {},
                    "properties": {
                        "_meta": {
                            "additionalProperties": {},
                            "description": "This parameter name is reserved by MCP to allow clients and servers to attach additional metadata to their notifications.",
                            "type": "object"
                        }
                    },
                    "type": "object"
                }
            },
            "required": [
                "method"
            ],
            "type": "object"
        },
        "PaginatedRequest": {
            "properties": {
                "method": {
                    "type": "string"
                },
                "params": {
                    "properties": {
                        "cursor": {
                            "description": "An opaque token representing the current pagination position.\nIf provided, the server should return results starting after this cursor.",
                            "type": "string"
                        }
                    },
                    "type": "object"
                }
            },
            "required": [
                "method"
            ],
            "type": "object"
        },
        "PaginatedResult": {
            "properties": {
                "_meta": {
                    "additionalProperties": {},
                    "description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
                    "type": "object"
                },
                "nextCursor": {
                    "description": "An opaque token representing the pagination position after the last returned result.\nIf present, there may be more results available.",
                    "type": "string"
                }
            },
            "type": "object"
        },
        "PingRequest": {
            "description": "A ping, issued by either the server or the client, to check that the other party is still alive. The receiver must promptly respond, or else may be disconnected.",
            "properties": {
                "method": {
                    "const": "ping",
                    "type": "string"
                },
                "params": {
                    "additionalProperties": {},
                    "properties": {
                        "_meta": {
                            "properties": {
                                "progressToken": {
                                    "$ref": "#/definitions/ProgressToken",
                                    "description": "If specified, the caller is requesting out-of-band progress notifications for this request (as represented by notifications/progress). The value of this parameter is an opaque token that will be attached to any subsequent notifications. The receiver is not obligated to provide these notifications."
                                }
                            },
                            "type": "object"
                        }
                    },
                    "type": "object"
                }
            },
            "required": [
                "method"
            ],
            "type": "object"
        },
        "ProgressNotification": {
            "description": "An out-of-band notification used to inform the receiver of a progress update for a long-running request.",
            "properties": {
                "method": {
                    "const": "notifications/progress",
                    "type": "string"
                },
                "params": {
                    "properties": {
                        "progress": {
                            "description": "The progress thus far. This should increase every time progress is made, even if the total is unknown.",
                            "type": "number"
                        },
                        "progressToken": {
                            "$ref": "#/definitions/ProgressToken",
                            "description": "The progress token which was given in the initial request, used to associate this notification with the request that is proceeding."
                        },
                        "total": {
                            "description": "Total number of items to process (or total progress required), if known.",
                            "type": "number"
                        }
                    },
                    "required": [
                        "progress",
                        "progressToken"
                    ],
                    "type": "object"
                }
            },
            "required": [
                "method",
                "params"
            ],
            "type": "object"
        },
        "ProgressToken": {
            "description": "A progress token, used to associate progress notifications with the original request.",
            "type": [
                "string",
                "integer"
            ]
        },
        "Prompt": {
            "description": "A prompt or prompt template that the server offers.",
            "properties": {
                "arguments": {
                    "description": "A list of arguments to use for templating the prompt.",
                    "items": {
                        "$ref": "#/definitions/PromptArgument"
                    },
                    "type": "array"
                },
                "description": {
                    "description": "An optional description of what this prompt provides",
                    "type": "string"
                },
                "name": {
                    "description": "The name of the prompt or prompt template.",
                    "type": "string"
                }
            },
            "required": [
                "name"
            ],
            "type": "object"
        },
        "PromptArgument": {
            "description": "Describes an argument that a prompt can accept.",
            "properties": {
                "description": {
                    "description": "A human-readable description of the argument.",
                    "type": "string"
                },
                "name": {
                    "description": "The name of the argument.",
                    "type": "string"
                },
                "required": {
                    "description": "Whether this argument must be provided.",
                    "type": "boolean"
                }
            },
            "required": [
                "name"
            ],
            "type": "object"
        },
        "PromptListChangedNotification": {
            "description": "An optional notification from the server to the client, informing it that the list of prompts it offers has changed. This may be issued by servers without any previous subscription from the client.",
            "properties": {
                "method": {
                    "const": "notifications/prompts/list_changed",
                    "type": "string"
                },
                "params": {
                    "additionalProperties": {},
                    "properties": {
                        "_meta": {
                            "additionalProperties": {},
                            "description": "This parameter name is reserved by MCP to allow clients and servers to attach additional metadata to their notifications.",
                            "type": "object"
                        }
                    },
                    "type": "object"
                }
            },
            "required": [
                "method"
            ],
            "type": "object"
        },
        "PromptMessage": {
            "description": "Describes a message returned as part of a prompt.\n\nThis is similar to `SamplingMessage`, but also supports the embedding of\nresources from the MCP server.",
            "properties": {
                "content": {
                    "anyOf": [
                        {
                            "$ref": "#/definitions/TextContent"
                        },
                        {
                            "$ref": "#/definitions/ImageContent"
                        },
                        {
                            "$ref": "#/definitions/EmbeddedResource"
                        }
                    ]
                },
                "role": {
                    "$ref": "#/definitions/Role"
                }
            },
            "required": [
                "content",
                "role"
            ],
            "type": "object"
        },
        "PromptReference": {
            "description": "Identifies a prompt.",
            "properties": {
                "name": {
                    "description": "The name of the prompt or prompt template",
                    "type": "string"
                },
                "type": {
                    "const": "ref/prompt",
                    "type": "string"
                }
            },
            "required": [
                "name",
                "type"
            ],
            "type": "object"
        },
        "ReadResourceRequest": {
            "description": "Sent from the client to the server, to read a specific resource URI.",
            "properties": {
                "method": {
                    "const": "resources/read",
                    "type": "string"
                },
                "params": {
                    "properties": {
                        "uri": {
                            "description": "The URI of the resource to read. The URI can use any protocol; it is up to the server how to interpret it.",
                            "format": "uri",
                            "type": "string"
                        }
                    },
                    "required": [
                        "uri"
                    ],
                    "type": "object"
                }
            },
            "required": [
                "method",
                "params"
            ],
            "type": "object"
        },
        "ReadResourceResult": {
            "description": "The server's response to a resources/read request from the client.",
            "properties": {
                "_meta": {
                    "additionalProperties": {},
                    "description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
                    "type": "object"
                },
                "contents": {
                    "items": {
                        "anyOf": [
                            {
                                "$ref": "#/definitions/TextResourceContents"
                            },
                            {
                                "$ref": "#/definitions/BlobResourceContents"
                            }
                        ]
                    },
                    "type": "array"
                }
            },
            "required": [
                "contents"
            ],
            "type": "object"
        },
        "Request": {
            "properties": {
                "method": {
                    "type": "string"
                },
                "params": {
                    "additionalProperties": {},
                    "properties": {
                        "_meta": {
                            "properties": {
                                "progressToken": {
                                    "$ref": "#/definitions/ProgressToken",
                                    "description": "If specified, the caller is requesting out-of-band progress notifications for this request (as represented by notifications/progress). The value of this parameter is an opaque token that will be attached to any subsequent notifications. The receiver is not obligated to provide these notifications."
                                }
                            },
                            "type": "object"
                        }
                    },
                    "type": "object"
                }
            },
            "required": [
                "method"
            ],
            "type": "object"
        },
        "RequestId": {
            "description": "A uniquely identifying ID for a request in JSON-RPC.",
            "type": [
                "string",
                "integer"
            ]
        },
        "Resource": {
            "description": "A known resource that the server is capable of reading.",
            "properties": {
                "annotations": {
                    "properties": {
                        "audience": {
                            "description": "Describes who the intended customer of this object or data is.\n\nIt can include multiple entries to indicate content useful for multiple audiences (e.g., `[\"user\", \"assistant\"]`).",
                            "items": {
                                "$ref": "#/definitions/Role"
                            },
                            "type": "array"
                        },
                        "priority": {
                            "description": "Describes how important this data is for operating the server.\n\nA value of 1 means \"most important,\" and indicates that the data is\neffectively required, while 0 means \"least important,\" and indicates that\nthe data is entirely optional.",
                            "maximum": 1,
                            "minimum": 0,
                            "type": "number"
                        }
                    },
                    "type": "object"
                },
                "description": {
                    "description": "A description of what this resource represents.\n\nThis can be used by clients to improve the LLM's understanding of available resources. It can be thought of like a \"hint\" to the model.",
                    "type": "string"
                },
                "mimeType": {
                    "description": "The MIME type of this resource, if known.",
                    "type": "string"
                },
                "name": {
                    "description": "A human-readable name for this resource.\n\nThis can be used by clients to populate UI elements.",
                    "type": "string"
                },
                "uri": {
                    "description": "The URI of this resource.",
                    "format": "uri",
                    "type": "string"
                }
            },
            "required": [
                "name",
                "uri"
            ],
            "type": "object"
        },
        "ResourceContents": {
            "description": "The contents of a specific resource or sub-resource.",
            "properties": {
                "mimeType": {
                    "description": "The MIME type of this resource, if known.",
                    "type": "string"
                },
                "uri": {
                    "description": "The URI of this resource.",
                    "format": "uri",
                    "type": "string"
                }
            },
            "required": [
                "uri"
            ],
            "type": "object"
        },
        "ResourceListChangedNotification": {
            "description": "An optional notification from the server to the client, informing it that the list of resources it can read from has changed. This may be issued by servers without any previous subscription from the client.",
            "properties": {
                "method": {
                    "const": "notifications/resources/list_changed",
                    "type": "string"
                },
                "params": {
                    "additionalProperties": {},
                    "properties": {
                        "_meta": {
                            "additionalProperties": {},
                            "description": "This parameter name is reserved by MCP to allow clients and servers to attach additional metadata to their notifications.",
                            "type": "object"
                        }
                    },
                    "type": "object"
                }
            },
            "required": [
                "method"
            ],
            "type": "object"
        },
        "ResourceReference": {
            "description": "A reference to a resource or resource template definition.",
            "properties": {
                "type": {
                    "const": "ref/resource",
                    "type": "string"
                },
                "uri": {
                    "description": "The URI or URI template of the resource.",
                    "format": "uri-template",
                    "type": "string"
                }
            },
            "required": [
                "type",
                "uri"
            ],
            "type": "object"
        },
        "ResourceTemplate": {
            "description": "A template description for resources available on the server.",
            "properties": {
                "annotations": {
                    "properties": {
                        "audience": {
                            "description": "Describes who the intended customer of this object or data is.\n\nIt can include multiple entries to indicate content useful for multiple audiences (e.g., `[\"user\", \"assistant\"]`).",
                            "items": {
                                "$ref": "#/definitions/Role"
                            },
                            "type": "array"
                        },
                        "priority": {
                            "description": "Describes how important this data is for operating the server.\n\nA value of 1 means \"most important,\" and indicates that the data is\neffectively required, while 0 means \"least important,\" and indicates that\nthe data is entirely optional.",
                            "maximum": 1,
                            "minimum": 0,
                            "type": "number"
                        }
                    },
                    "type": "object"
                },
                "description": {
                    "description": "A description of what this template is for.\n\nThis can be used by clients to improve the LLM's understanding of available resources. It can be thought of like a \"hint\" to the model.",
                    "type": "string"
                },
                "mimeType": {
                    "description": "The MIME type for all resources that match this template. This should only be included if all resources matching this template have the same type.",
                    "type": "string"
                },
                "name": {
                    "description": "A human-readable name for the type of resource this template refers to.\n\nThis can be used by clients to populate UI elements.",
                    "type": "string"
                },
                "uriTemplate": {
                    "description": "A URI template (according to RFC 6570) that can be used to construct resource URIs.",
                    "format": "uri-template",
                    "type": "string"
                }
            },
            "required": [
                "name",
                "uriTemplate"
            ],
            "type": "object"
        },
        "ResourceUpdatedNotification": {
            "description": "A notification from the server to the client, informing it that a resource has changed and may need to be read again. This should only be sent if the client previously sent a resources/subscribe request.",
            "properties": {
                "method": {
                    "const": "notifications/resources/updated",
                    "type": "string"
                },
                "params": {
                    "properties": {
                        "uri": {
                            "description": "The URI of the resource that has been updated. This might be a sub-resource of the one that the client actually subscribed to.",
                            "format": "uri",
                            "type": "string"
                        }
                    },
                    "required": [
                        "uri"
                    ],
                    "type": "object"
                }
            },
            "required": [
                "method",
                "params"
            ],
            "type": "object"
        },
        "Result": {
            "additionalProperties": {},
            "properties": {
                "_meta": {
                    "additionalProperties": {},
                    "description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
                    "type": "object"
                }
            },
            "type": "object"
        },
        "Role": {
            "description": "The sender or recipient of messages and data in a conversation.",
            "enum": [
                "assistant",
                "user"
            ],
            "type": "string"
        },
        "Root": {
            "description": "Represents a root directory or file that the server can operate on.",
            "properties": {
                "name": {
                    "description": "An optional name for the root. This can be used to provide a human-readable\nidentifier for the root, which may be useful for display purposes or for\nreferencing the root in other parts of the application.",
                    "type": "string"
                },
                "uri": {
                    "description": "The URI identifying the root. This *must* start with file:// for now.\nThis restriction may be relaxed in future versions of the protocol to allow\nother URI schemes.",
                    "format": "uri",
                    "type": "string"
                }
            },
            "required": [
                "uri"
            ],
            "type": "object"
        },
        "RootsListChangedNotification": {
            "description": "A notification from the client to the server, informing it that the list of roots has changed.\nThis notification should be sent whenever the client adds, removes, or modifies any root.\nThe server should then request an updated list of roots using the ListRootsRequest.",
            "properties": {
                "method": {
                    "const": "notifications/roots/list_changed",
                    "type": "string"
                },
                "params": {
                    "additionalProperties": {},
                    "properties": {
                        "_meta": {
                            "additionalProperties": {},
                            "description": "This parameter name is reserved by MCP to allow clients and servers to attach additional metadata to their notifications.",
                            "type": "object"
                        }
                    },
                    "type": "object"
                }
            },
            "required": [
                "method"
            ],
            "type": "object"
        },
        "SamplingMessage": {
            "description": "Describes a message issued to or received from an LLM API.",
            "properties": {
                "content": {
                    "anyOf": [
                        {
                            "$ref": "#/definitions/TextContent"
                        },
                        {
                            "$ref": "#/definitions/ImageContent"
                        }
                    ]
                },
                "role": {
                    "$ref": "#/definitions/Role"
                }
            },
            "required": [
                "content",
                "role"
            ],
            "type": "object"
        },
        "ServerCapabilities": {
            "description": "Capabilities that a server may support. Known capabilities are defined here, in this schema, but this is not a closed set: any server can define its own, additional capabilities.",
            "properties": {
                "experimental": {
                    "additionalProperties": {
                        "additionalProperties": true,
                        "properties": {},
                        "type": "object"
                    },
                    "description": "Experimental, non-standard capabilities that the server supports.",
                    "type": "object"
                },
                "logging": {
                    "additionalProperties": true,
                    "description": "Present if the server supports sending log messages to the client.",
                    "properties": {},
                    "type": "object"
                },
                "prompts": {
                    "description": "Present if the server offers any prompt templates.",
                    "properties": {
                        "listChanged": {
                            "description": "Whether this server supports notifications for changes to the prompt list.",
                            "type": "boolean"
                        }
                    },
                    "type": "object"
                },
                "resources": {
                    "description": "Present if the server offers any resources to read.",
                    "properties": {
                        "listChanged": {
                            "description": "Whether this server supports notifications for changes to the resource list.",
                            "type": "boolean"
                        },
                        "subscribe": {
                            "description": "Whether this server supports subscribing to resource updates.",
                            "type": "boolean"
                        }
                    },
                    "type": "object"
                },
                "tools": {
                    "description": "Present if the server offers any tools to call.",
                    "properties": {
                        "listChanged": {
                            "description": "Whether this server supports notifications for changes to the tool list.",
                            "type": "boolean"
                        }
                    },
                    "type": "object"
                }
            },
            "type": "object"
        },
        "ServerNotification": {
            "anyOf": [
                {
                    "$ref": "#/definitions/CancelledNotification"
                },
                {
                    "$ref": "#/definitions/ProgressNotification"
                },
                {
                    "$ref": "#/definitions/ResourceListChangedNotification"
                },
                {
                    "$ref": "#/definitions/ResourceUpdatedNotification"
                },
                {
                    "$ref": "#/definitions/PromptListChangedNotification"
                },
                {
                    "$ref": "#/definitions/ToolListChangedNotification"
                },
                {
                    "$ref": "#/definitions/LoggingMessageNotification"
                }
            ]
        },
        "ServerRequest": {
            "anyOf": [
                {
                    "$ref": "#/definitions/PingRequest"
                },
                {
                    "$ref": "#/definitions/CreateMessageRequest"
                },
                {
                    "$ref": "#/definitions/ListRootsRequest"
                }
            ]
        },
        "ServerResult": {
            "anyOf": [
                {
                    "$ref": "#/definitions/Result"
                },
                {
                    "$ref": "#/definitions/InitializeResult"
                },
                {
                    "$ref": "#/definitions/ListResourcesResult"
                },
                {
                    "$ref": "#/definitions/ReadResourceResult"
                },
                {
                    "$ref": "#/definitions/ListPromptsResult"
                },
                {
                    "$ref": "#/definitions/GetPromptResult"
                },
                {
                    "$ref": "#/definitions/ListToolsResult"
                },
                {
                    "$ref": "#/definitions/CallToolResult"
                },
                {
                    "$ref": "#/definitions/CompleteResult"
                }
            ]
        },
        "SetLevelRequest": {
            "description": "A request from the client to the server, to enable or adjust logging.",
            "properties": {
                "method": {
                    "const": "logging/setLevel",
                    "type": "string"
                },
                "params": {
                    "properties": {
                        "level": {
                            "$ref": "#/definitions/LoggingLevel",
                            "description": "The level of logging that the client wants to receive from the server. The server should send all logs at this level and higher (i.e., more severe) to the client as notifications/logging/message."
                        }
                    },
                    "required": [
                        "level"
                    ],
                    "type": "object"
                }
            },
            "required": [
                "method",
                "params"
            ],
            "type": "object"
        },
        "SubscribeRequest": {
            "description": "Sent from the client to request resources/updated notifications from the server whenever a particular resource changes.",
            "properties": {
                "method": {
                    "const": "resources/subscribe",
                    "type": "string"
                },
                "params": {
                    "properties": {
                        "uri": {
                            "description": "The URI of the resource to subscribe to. The URI can use any protocol; it is up to the server how to interpret it.",
                            "format": "uri",
                            "type": "string"
                        }
                    },
                    "required": [
                        "uri"
                    ],
                    "type": "object"
                }
            },
            "required": [
                "method",
                "params"
            ],
            "type": "object"
        },
        "TextContent": {
            "description": "Text provided to or from an LLM.",
            "properties": {
                "annotations": {
                    "properties": {
                        "audience": {
                            "description": "Describes who the intended customer of this object or data is.\n\nIt can include multiple entries to indicate content useful for multiple audiences (e.g., `[\"user\", \"assistant\"]`).",
                            "items": {
                                "$ref": "#/definitions/Role"
                            },
                            "type": "array"
                        },
                        "priority": {
                            "description": "Describes how important this data is for operating the server.\n\nA value of 1 means \"most important,\" and indicates that the data is\neffectively required, while 0 means \"least important,\" and indicates that\nthe data is entirely optional.",
                            "maximum": 1,
                            "minimum": 0,
                            "type": "number"
                        }
                    },
                    "type": "object"
                },
                "text": {
                    "description": "The text content of the message.",
                    "type": "string"
                },
                "type": {
                    "const": "text",
                    "type": "string"
                }
            },
            "required": [
                "text",
                "type"
            ],
            "type": "object"
        },
        "TextResourceContents": {
            "properties": {
                "mimeType": {
                    "description": "The MIME type of this resource, if known.",
                    "type": "string"
                },
                "text": {
                    "description": "The text of the item. This must only be set if the item can actually be represented as text (not binary data).",
                    "type": "string"
                },
                "uri": {
                    "description": "The URI of this resource.",
                    "format": "uri",
                    "type": "string"
                }
            },
            "required": [
                "text",
                "uri"
            ],
            "type": "object"
        },
        "Tool": {
            "description": "Definition for a tool the client can call.",
            "properties": {
                "description": {
                    "description": "A human-readable description of the tool.",
                    "type": "string"
                },
                "inputSchema": {
                    "description": "A JSON Schema object defining the expected parameters for the tool.",
                    "properties": {
                        "properties": {
                            "additionalProperties": {
                                "additionalProperties": true,
                                "properties": {},
                                "type": "object"
                            },
                            "type": "object"
                        },
                        "type": {
                            "const": "object",
                            "type": "string"
                        }
                    },
                    "required": [
                        "type"
                    ],
                    "type": "object"
                },
                "name": {
                    "description": "The name of the tool.",
                    "type": "string"
                }
            },
            "required": [
                "inputSchema",
                "name"
            ],
            "type": "object"
        },
        "ToolListChangedNotification": {
            "description": "An optional notification from the server to the client, informing it that the list of tools it offers has changed. This may be issued by servers without any previous subscription from the client.",
            "properties": {
                "method": {
                    "const": "notifications/tools/list_changed",
                    "type": "string"
                },
                "params": {
                    "additionalProperties": {},
                    "properties": {
                        "_meta": {
                            "additionalProperties": {},
                            "description": "This parameter name is reserved by MCP to allow clients and servers to attach additional metadata to their notifications.",
                            "type": "object"
                        }
                    },
                    "type": "object"
                }
            },
            "required": [
                "method"
            ],
            "type": "object"
        },
        "UnsubscribeRequest": {
            "description": "Sent from the client to request cancellation of resources/updated notifications from the server. This should follow a previous resources/subscribe request.",
            "properties": {
                "method": {
                    "const": "resources/unsubscribe",
                    "type": "string"
                },
                "params": {
                    "properties": {
                        "uri": {
                            "description": "The URI of the resource to unsubscribe from.",
                            "format": "uri",
                            "type": "string"
                        }
                    },
                    "required": [
                        "uri"
                    ],
                    "type": "object"
                }
            },
            "required": [
                "method",
                "params"
            ],
            "type": "object"
        }
    }
}
