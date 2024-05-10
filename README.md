# Joe's Art Workspace (JAW)

_Need a better name!_

Just playing around here but goal is something I can use to make computer art
that works the way I'm thinking. Also, for me, easier to build a tool than
actually build the art so it is a form of procrastination.

Similar to cuttle.xyz in a lot of ways in that it has a strong model that is
programmable but also is very approachable. Also inspired by Desmos as things
are interactive any you can play with a composition. Perhaps hints of modular
synth in that there are building blocks that can be hooked together.

## Ideas

- Javascript/typescript based.
- Processing as base?
  - Allow retargeting to other engines?
- Set of core shape primitives that know how to draw themselves and have a set
  of properties on them.
  - Users can create new shapes with code.
- Composite shapes standard library and code defining new ones
  - Group is key
- Properties
  - Set of core types
  - Composite properties using javascript.
    - Need to understand dependencies and find loops? Perhaps have dependency
      loops and just evaluate once per tick. Need stable order of evaluation
      then. Feedback loops key part of modular synth.
  - Perhaps have value generators. Things like noise and timelines and time
    loops?
    - Can these reference each other? Loops? DAG?
- Core structure is tree?
  - Allow for nesting. Probably not recursion.
  - Persistance format
- Authoring tool
  - A way to just drag/drop to define composition
  - Node and edge graph like many other tools?
  - Blank canvas with hierarchy like cuttle? Thinking this to make it easier to
    get started and more immediate.
- Code gen
  - Use as an example/teaching tool for code. Generate processing
- Root thing is a "composition"
  - Has value generators (timelines, noise)
  - Has properties. Type, range, default. Can reference value generators.
  - Has root "group" composite shape
  - Other compositions can be embedded
- Make it spontanious
  - Random name generator that is fun
  - Random picker tool
  - Color pallette as primitive? (similar to scale/quantization in synth)
    - Discrete and predefined
    - Gradient with even stops
  - Connect to MIDI or modular ADC components (Expert Sleepers ES-8, for example)

## Plan

Don't get stuck. Get something working before making it pretty. Worry about
creating the "right" environment later. See if there is something interesting
first.

First project trying to use co-pilot. Let's see if it is helpful.

Start with defining core shapes and perhaps grouping. Play with typescript?

### Main Object Model

- **Canvas**: A space that things are drawn into. Has a root **Node**. All
  other objects are created in a **Canvas** and can't be used across multiple.
- **Node**: A drawable thing.
  - method _draw_: Produces **RenderPrimitive**s that can be manipulated by
    other entities are eventually concretely rendered to the screen.
    - [idea] May be called multiple times in multple contexts to generate different content
      based on a render index.
  - attribute _parent_
  - attribute _children_: a list of **Node**s
  - Multiple members that are **AttributeSet**
  - attribute _modifiers_: a list of **Modifier**s
- **AttributeSet**: A set of attributes that is attached to a Node. Can be
  enabled/disabled. The set of these is hardcoded. Some allow for inheritence down the
  **Node** hierarchy.
- **Modifier**: Rendering middleware. Takes a set of **DrawPrimitives**,
  modifies them and returns a set of **DrawPrimitives**.
- **RenderPrimitive**: a thing that can be drawn. Need more detail but likely to
  start with a simple path construct.
- Core Types: Color, Vector, AffineMatrix
- **ValueGenerator**: a thing that produce values that can be referenced in
  various places. Probably includes timelines and noise functions.
- **ValueFunction**: A function takes a **RenderContext** and returns a concrete
  value used for rendering.
  - _TODO_: Probably need to be able to take code and evaluate in an
    isolated/safe context.
- **RenderContext**: An arbitrary bag of concrete data that can be used as
  context when rendering.

**TODO**: Do we make attributes self describing for GUIs?

### Rendering Process

_(So far!)_

1. Canvas has root to a hierarchy of Nodes.
1. Main calls `Canvas.doRender`
   1. Background is cleared
   1. `Node.draw` is called on root. This returns a RenderPrimitive. Context is
      passed down with the accumulated transform to the root.
   1. `RenderPrimitive.htmlCanvasRender` is called on the RenderPrimitive to render
      to HTML Canvas element. This will set the transform into the Canvas2D
      context automatically for each object during the recursive descent.

## Technologies to consider

What are libraries or other technologies that I might want to consider.

### Reactive Frameworks?

I'm leaning against this as often these are optimized around having changes
**pushed** at them and then doing a minimal recomputation based on that. Since
we are likely to operate on a tick like a game engine we can just pull new
values and reevaluate the entire scene each frame.

### ECS

Each node in the tree will have a set of optional attributes. We want this to
be extensible. In some way this is similar to an ECS system. I looked at ECS
systems briefly and there are some interesting choices but the focus is on doing
things like querying (give me all of the entities with component X) and we don't
need that. In addition, the ordering of "components" is somewhat unique.
Finally, many of these expect a closed set of "components" that are directly
known to the entity definition. This isn't applicable here as we want this to be
extensible.

### Mixins

I don't think this'll work. In general it is more static and we expect that the
Mixin will extend the definition of the base class. I think we want modifiers
to be an explicit thing that can be queried, enabled/disabled, add/removed, etc.
We also want to track the order of modifiers.
