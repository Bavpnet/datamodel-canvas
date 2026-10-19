# Schema Visualizer

Prototype of a datamodel canvas built with React, Vite, and [React Flow](https://reactflow.dev/).

- Right panel lists tables and columns from the datamodel
- Drag a table from Данные onto the canvas to place a scheme
- Table cards are draggable on the canvas
- Canvas connections are view-only; add or edit relations through the Связи panel
- Default relations use the same tables and fields listed in Данные
- Click a field, connection line, or endpoint badge to highlight related fields, dots, badges, and line
- Click empty canvas to clear the selection

```bash
npm install
npm run dev
```

Organize tables uses a visual star layout: the table with the most many-side relations becomes the center, related tables occupy outer rings, and disconnected groups stay separate. Table data and relation cardinalities are unchanged.


## Deploy on Vercel

Import this repository into Vercel and use the Vite preset. The checked-in
`vercel.json` configures `npm run build` and the `dist` output directory.
No environment variables or backend are required. Both demo models are included.
The application keeps changes in the current browser session only.
