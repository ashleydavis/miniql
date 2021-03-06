import { miniql, IQuery } from "..";
import { IQueryResolver } from "@miniql/core-types";

describe("nested entities", () => {

    it("can get one nested entity", async ()  => {

        const query: IQuery = {
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                    resolve: {
                        director: {
                        },
                    },
                },
            },
        };

        const root: IQueryResolver = {
            get: {
                movie: {
                    invoke: async (args: any, context: any) => {
                        expect(args.id).toBe("1234");
        
                        return {
                            id: "1234",
                            name: "Minority Report",
                            year: 2002,
                            director: "5678",
                        };
                    },

                    nested: {
                        director: {
                            invoke: async (parent: any, args: any, context: any) => {
                                expect(parent.director).toBe("5678");

                                return {
                                    id: "5678",
                                    name: "Steven Spielberg",
                                };
                            },
                        },
                    },
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: {
                id: "1234",
                name: "Minority Report",
                year: 2002,
                director: {
                    id: "5678",
                    name: "Steven Spielberg",
                },
            },
        });
    });

    it("can get another level of nested entity", async ()  => {

        const query: IQuery = {
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                    resolve: {
                        director: {
                            resolve: {
                                hometown: {

                                },
                            },
                        },
                    },
                },
            },
        };

        const root: IQueryResolver = {
            get: {
                movie: {
                    invoke: async (args: any, context: any) => {
                        expect(args.id).toBe("1234");
        
                        return {
                            id: "1234",
                            name: "Minority Report",
                            year: 2002,
                            director: "5678",
                        };
                    },

                    nested: {
                        director: {
                            invoke: async (parent: any, args: any, context: any) => {
                                expect(parent.director).toBe("5678");

                                return {
                                    id: "5678",
                                    name: "Steven Spielberg",
                                    hometown: "3456",
                                };
                            },
                        },
                    },
                },

                director: {
                    // Just a stub. This won't be called.
                    invoke: async () => {
                        throw new Error("Shouldn't be invoked.");
                    }, 

                    nested: {
                        hometown: {
                            invoke: async (parent: any, args: any, context: any) => {
                                expect(parent.hometown).toBe("3456");

                                return {
                                    id: "3456",
                                    name: "Chicago",
                                };
                            },
                        },
                    },
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: {
                id: "1234",
                name: "Minority Report",
                year: 2002,
                director: {
                    id: "5678",
                    name: "Steven Spielberg",
                    hometown: {
                        id: "3456",
                        name: "Chicago",
                    },
                },
            },
        });
    });

    it("can get another level of nested entity when the name of the nested entity is different to the global name", async ()  => {

        const query: IQuery = {
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                    resolve: {
                        the_director: {
                            resolve: {
                                hometown: {

                                },
                            },
                        },
                    },
                },
            },
        };

        const root: IQueryResolver = {
            get: {
                movie: {
                    invoke: async (args: any, context: any) => {
                        expect(args.id).toBe("1234");
        
                        return {
                            id: "1234",
                            name: "Minority Report",
                            year: 2002,
                            the_director: "5678",
                        };
                    },

                    nested: {
                        the_director: {
                            from: "director",
                            invoke: async (parent: any, args: any, context: any) => {
                                expect(parent.the_director).toBe("5678");

                                return {
                                    id: "5678",
                                    name: "Steven Spielberg",
                                    hometown: "3456",
                                };
                            },
                        },
                    },
                },

                director: {
                    invoke: async () => {
                        throw new Error("Shouldn't be invoked.");
                    }, 

                    nested: {
                        hometown: {
                            invoke: async (parent: any, args: any, context: any) => {
                                expect(parent.hometown).toBe("3456");

                                return {
                                    id: "3456",
                                    name: "Chicago",
                                };
                            },
                        },
                    },
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: {
                id: "1234",
                name: "Minority Report",
                year: 2002,
                the_director: {
                    id: "5678",
                    name: "Steven Spielberg",
                    hometown: {
                        id: "3456",
                        name: "Chicago",
                    },
                },
            },
        });
    });

    it("getting a nested entity doesn't modify source entity", async ()  => {

        const query: IQuery = {
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                    resolve: {
                        director: {
                        },
                    },
                },
            },
        };

        const sourceEntity = {
            id: "1234",
            name: "Minority Report",
            year: 2002,
            director: "5678",
        };

        const root: IQueryResolver = {
            get: {
                movie: {
                    invoke: async (args: any, context: any) => {
                        expect(args.id).toBe("1234");
        
                        return sourceEntity;
                    },

                    nested: {
                        director: {
                            invoke: async (parent: any, args: any, context: any) => {
                                expect(parent.director).toBe("5678");

                                return {
                                    id: "5678",
                                    name: "Steven Spielberg",
                                };
                            },
                        },
                    },
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(sourceEntity.director).toEqual("5678");
        expect(result.movie.director).toEqual({
            id: "5678",
            name: "Steven Spielberg",
        });
    });

    it("can get one nested entity with id from field", async ()  => {

        const query: IQuery = {
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                    resolve: {
                        director: {
                            from: "__director",
                        },
                    },
                },
            },
        };

        const root: IQueryResolver = {
            get: {
                movie: {
                    invoke: async (args: any, context: any) => {
                        expect(args.id).toBe("1234");
        
                        return {
                            id: "1234",
                            name: "Minority Report",
                            year: 2002,
                            directorId: "5678",
                        };
                    },

                    nested: {
                        __director: {
                            invoke: async (parent: any, args: any, context: any) => {
                                expect(parent.directorId).toBe("5678");
                
                                return {
                                    id: "5678",
                                    name: "Steven Spielberg",
                                };
                            },
                        },
                    },
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: {
                id: "1234",
                name: "Minority Report",
                year: 2002,
                director: {
                    id: "5678",
                    name: "Steven Spielberg",
                },
                directorId: "5678",  //TODO: Be good be good to be able to exclude this.
            },
        });
    });

    it("can retrieve multiple nested entities", async ()  => {

        const query: IQuery = {
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                    resolve: {
                        actors: {
                            
                        },
                    },
                },
            },
        };

        const root: IQueryResolver = {
            get: {
                movie: {
                    invoke: async (args: any, context: any) => {
                        expect(args.id).toBe("1234");
        
                        return {
                            id: "1234",
                            name: "Minority Report",
                            year: 2002,
                            actorIds: [
                                "5678",
                                "5679",
                            ],
                        };
                    },
    
                    nested: {
                        actors: {
                            invoke: async (parent: any, args: any, context: any) => {
                                expect(parent.actorIds).toEqual([
                                    "5678",
                                    "5679",
                                ]);

                                return [
                                    {
                                        id: "5678",
                                        name: "Tom Cruise",
                                    },
                                    {
                                        id: "5679",
                                        name: "Samantha Morton",
                                    },
                                ];
                            },
                        },
                    },
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: {
                id: "1234",
                name: "Minority Report",
                year: 2002,
                actors: [
                    {
                        id: "5678",
                        name: "Tom Cruise",
                    },
                    {
                        id: "5679",
                        name: "Samantha Morton",
                    },
                ],
                actorIds: [ //TODO: Be good be good to be able to exclude this.
                    "5678",
                    "5679",
                ],
            },
        });
    });    

    it("can retrieve multiple entiites each with a single nested entity", async ()  => {

        const query: IQuery = {
            get: {
                movie: {
                    resolve: {
                        director: {
                        },
                    },
                },
            },
        };

        const root: IQueryResolver = {
            get: {
                movie: {
                    invoke: async (args: any, context: any) => {
                        return [
                            {
                                name: "Minority Report",
                                year: 2002,
                                directorId: "1234",
                            },
                            {
                                name: "The Bourne Identity",
                                year: 2002,
                                directorId: "5678",
                            },
                        ];
                    },

                    nested: {
                        director: {
                            invoke: async (parent: any, args: any, context: any) => {
                                if (parent.directorId === "1234") {
                                    return {
                                        id: "1234",
                                        name: "Steven Spielberg",
                                    };
                                }
                                else if (parent.directorId === "5678") {
                                    return {
                                        id: "5678",
                                        name: "Doug Liman",
                                    };
                                }
                                else {
                                    throw new Error("Unexpected id: " + parent.directorId);
                                }
                            },
                        },
                    },
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: [
                {
                    name: "Minority Report",
                    year: 2002,
                    director: {
                        id: "1234",
                        name: "Steven Spielberg",
                    },
                    directorId: "1234", // TODO: EXCLUDE
                },
                {
                    name: "The Bourne Identity",
                    year: 2002,
                    director: {
                        id: "5678",
                        name: "Doug Liman",
                    },
                    directorId: "5678", // TODO: EXCLUDE
                },
            ],
        });
    });    

    it("can retrieve multiple entiites each with multiple nested entities", async ()  => {

        const query: IQuery = {
            get: {
                movie: {
                    resolve: {
                        actors: {
                        },
                    },
                },
            },
        };

        const root: IQueryResolver = {
            get: {
                movie: {
                    invoke: async (args: any, context: any) => {
                        return [
                            {
                                name: "Minority Report",
                                year: 2002,
                                actorIds: [
                                    "1234",
                                    "5678",
                                ],
                            },
                            {
                                name: "The Bourne Identity",
                                year: 2002,
                                actorIds: [
                                    "9123",
                                ],
                            },
                        ];
                    },
    
                    nested: {
                        actors: {
                            invoke: async (parent: any, args: any, context: any) => {
                                return parent.actorIds.map((id: string) => {
                                    if (id === "1234") {
                                        return {
                                            id: "1234",
                                            name: "Tom Cruise",
                                        };
                                    }
                                    else if (id === "5678") {
                                        return {
                                            id: "5678",
                                            name: "Samantha Morton",
                                        };
                                    }
                                    else if (id === "9123") {
                                        return {
                                            id: "9123",
                                            name: "Matt Daemon",
                                        };
                                    }
                                    else {
                                        throw new Error("Unexpected id: " + id);
                                    }
                                });
                            },
                        },
                    },
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: [
                {
                    name: "Minority Report",
                    year: 2002,
                    actors: [
                        {
                            id: "1234",
                            name: "Tom Cruise",
                        },
                        {
                            id: "5678",
                            name: "Samantha Morton",
                        },
                    ],
                    actorIds: [
                        "1234",
                        "5678",
                    ],
                },
                {
                    name: "The Bourne Identity",
                    year: 2002,
                    actors: [
                        {
                            id: "9123",
                            name: "Matt Daemon",
                        },
                    ],
                    actorIds: [
                        "9123",
                    ],
                },
            ],
        });
    });    

    it("can retrieve multiple nested entities with no explicit ids", async ()  => {

        const query: IQuery = {
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                    resolve: {
                        actors: {
                        },
                    },
                },
            },
        };

        const root: IQueryResolver = {
            get: {
                movie: {
                    invoke: async (args: any, context: any) => {
                        expect(args.id).toBe("1234");
        
                        return {
                            id: "1234",
                            name: "Minority Report",
                            year: 2002,
                        };
                    },

                    nested: {
                        actors: {
                            invoke: async (parent: any, args: any, context: any) => {
                                expect(parent.id).toBe("1234");

                                return [
                                    {
                                        id: "5678",
                                        name: "Tom Cruise",
                                    },
                                    {
                                        id: "5679",
                                        name: "Samantha Morton",
                                    },
                                ];
                            },
                        },
                    },
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: {
                id: "1234",
                name: "Minority Report",
                year: 2002,
                actors: [
                    {
                        id: "5678",
                        name: "Tom Cruise",
                    },
                    {
                        id: "5679",
                        name: "Samantha Morton",
                    },
                ],
            },
        });
    });    

    it("can retrieve multiple entities with multipled nested entities with no explicit ids", async ()  => {

        const query = {
            get: {
                movie: {
                    resolve: {
                        actors: {
                        },
                    },
                },
            },
        };

        const root = {
            get: {
                movie: {
                    invoke: async (args: any, context: any) => {
                        return [
                            {
                                id: "1234",
                                name: "Minority Report",
                                year: 2002,
                            },
                            {
                                id: "5678",
                                name: "The Bourne Identity",
                                year: 2002,
                            },
                        ];
                    },
                    
                    nested: {
                        actors: {
                            invoke: async (parent: any, args: any, context: any) => {
                                if (parent.id === "1234") {
                                    return [
                                        {
                                            id: "2345",
                                            name: "Tom Cruise",
                                        },
                                        {
                                            id: "3456",
                                            name: "Samantha Morton",
                                        },
                                    ];
                                }
                                else if (parent.id === "5678") {
                                    return [
                                        {
                                            id: "4567",
                                            name: "Matt Daemon",
                                        },
                                    ];
                                }
                                else {
                                    throw new Error(`Unexpected movie id ${parent.id}.`);
                                }
                            },
                        },
                    },
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: [
                {
                    id: "1234",
                    name: "Minority Report",
                    year: 2002,
                    actors: [
                        {
                            id: "2345",
                            name: "Tom Cruise",
                        },
                        {
                            id: "3456",
                            name: "Samantha Morton",
                        },
                    ],
                },
                {
                    id: "5678",
                    name: "The Bourne Identity",
                    year: 2002,
                    actors: [
                        {
                            id: "4567",
                            name: "Matt Daemon",
                        },
                    ],
                },
            ],
        });
    });    

    it("nested entity resolver can return undefined to indicate entity not found", async ()  => {

        const query: IQuery = {
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                    resolve: {
                        director: {
                        },
                    },
                },
            },
        };

        const root: IQueryResolver = {
            get: {
                movie: {
                    invoke: async (args: any, context: any) => {
                        expect(args.id).toBe("1234");
        
                        return {
                            id: "1234",
                            name: "Minority Report",
                            year: 2002,
                            director: "5678",
                        };
                    },

                    nested: {
                        director: {
                            invoke: async (parent: any, args: any, context: any) => {
                                return undefined;
                            },
                        },
                    },
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: {
                id: "1234",
                name: "Minority Report",
                year: 2002,
                director: undefined,
            },
        });
    });

    it("nested entity resolver can return null to indicate entity not found", async ()  => {

        const query: IQuery = {
            get: {
                movie: {
                    args: {
                        id: "1234",
                    },
                    resolve: {
                        director: {
                        },
                    },
                },
            },
        };

        const root: IQueryResolver = {
            get: {
                movie: {
                    invoke: async (args: any, context: any) => {
                        expect(args.id).toBe("1234");
        
                        return {
                            id: "1234",
                            name: "Minority Report",
                            year: 2002,
                            director: "5678",
                        };
                    },

                    nested: {
                        director: {
                            invoke: async (parent: any, args: any, context: any) => {
                                return null;
                            },
                        },
                    },
                },
            },
        };

        const result = await miniql(query, root, {});
        expect(result).toEqual({
            movie: {
                id: "1234",
                name: "Minority Report",
                year: 2002,
                director: null,
            },
        });
    });
});
