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

## Plan

Don't get stuck. Get something working before making it pretty.  Worry about
creating the "right" environment later.  See if there is something interesting
first.

First project trying to use co-pilot.  Let's see if it is helpful.