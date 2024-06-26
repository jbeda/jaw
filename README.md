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

- `Canvas`: A space that things are drawn into. Has a root **Node**. All
  other objects are created in a **Canvas** and can't be used across multiple.
  - Currently has 1 implementation that is an HTML Canvas element.
- `Node`: A drawable thing. It creates a plan that can then be rendered.
  - method `Node.plan`: Produces `RenderPrimitive`s that can be manipulated by
    other entities are eventually concretely rendered to the screen. Works
    recursively down the node hierarchy.
    - Uses a `PlanContext` to pass down current transform along with rendering
      attributes.
    - [idea] May be called multiple times in multple contexts to generate different content
      based on a render index.
  - attribute `parent`
    - [idea] What would it look like for a `Node` to have multiple parents?
      Inherited values are only avaiable during the Planning pass.
  - attribute `children`: a list of `Node`s
  - attribute `modifiers`: a list of `Modifier`s
  - Core rendering attributes - `Transform`, `Fill`, `Stroke`
  - It is expected that custom `Node`s will be created.
- `Modifier`: Rendering middleware called during the planning pass.. Takes a
  `DrawPrimitives`, modifies them and returns a `DrawPrimitives`. Has access to
  the `PlanContext`.
- `RenderPrimitive`: a thing that can be drawn. Right now just supports groups
  and simple paths (lines and quadradic beziers).
  - Generally, we don't expect users to create new RenderPrimitives.
  - [idea] Extend with rasterization/composition layers.
- _Value generators_: Things that produce values per frame in an interesting way.
  Typically passed down to `Node.plan` via the context. Currently includes
  `Timeline` object. Will include noise functions.
- `Attr<T>`: Either a concrete value or a function takes a **PlanContext** and
  returns a concrete value used for rendering.
  - _TODO_: Probably need to be able to take code and evaluate in an
    isolated/safe context.
  - There are tools to take an object with `Attr`s and resolve them into a
    parallel object with just concrete values.

**TODO**: Do we make attributes self describing for GUIs?

### Rendering Process

_(So far!)_

1. Canvas has root to a hierarchy of Nodes.
1. "Main" calls `Canvas.renderOnce` with a `PlanContext`

   1. Background is cleared using `Canvas.bgFill`
   1. **Planning Pass**: `Node.plan` is called on `Canvas.root`. This returns a
      `RenderPlan`. Context (`PlanContext`) is passed down with from the root.
      Context is limited to that exposed explicitly by the user.  Each node
      doesn't know it's position in the world or the overriding style (fill,
      stroke).

      After each node does returns their `RenderPlan` transforms and styles are
      applied.  Styles on parent elements (`RenderPlanGroup`) will override any
      styles applied by lower level `Node`s.

      Subclasses are meant to implement drawing logic in `Node.drawImpl`. The
      current node transform and attributes are applied before `Node.drawImpl`
      is called.

      During the planning pass, any dynamic attributes are resolved to concrete
      attributes before being used or baked into the plan.

   1. \*_Rendering Pass_: `RenderPrimitive.htmlCanvasRender` is called on the
      RenderPrimitive to render to HTML Canvas element. This is a relatively
      straightforward translation of the `RenderPlan` to Canvas2D API calls.

### Thoughts on context and modifiers

What should we put in the context that is passed down to the nodes during the
planning phase?  Originally I had the transform to the parent along with style
(fill/stroke) but I removed that and had that be applied outside of the node
rendering.

The key insight here is that we don't want to create dependency loops.  A key
modifier will be something like "grid" that will take the children and replicate
them in a grid.  Do we do this by calling "plan" on the children multiple times?
Or by having the modifier the `RenderPlan`?  Or both?

Current plan:
1. Context has no "automatic" data but only that which is explictly set on it by
  parent nodes.
1. Modifiers have a method called `createContexts` that takes in the context and
   returns an array of contexts.  The children are then called to plan for
   each context.

   It is expected that the modifier can create multiple contexts with, say, an
   index embedded in it at some point.  Or any other data that it wants children
   to key off of.
1. Modifiers then also have a method called `modify`.  This is provided an array
   of `RenderPlan`s and returns an array of `RenderPlan`s.  The input has one rp
   per context created.  The modifier can then do whatever it wants with the
   input.  It could clone or collapse or position the sub `RenderPlan`s in any
   way that makes sense.

## Technologies to consider

What are libraries or other technologies that I might want to consider.

### Reactive Frameworks?

I'm leaning against this as often these are optimized around having changes
**pushed** at them and then doing a minimal recomputation based on that. Since
we are likely to operate on a tick like a game engine we can just pull new
values and reevaluate the entire scene each frame.

Example: https://rxjs.dev/

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
