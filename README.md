# Fungus Friends App

All kinds of fungus friends can be found in the garden of SpronQ it is your task to show them on a map.

## Requested features
 - Use the supplied api.ts script without alteration. (It is allowed though to remove the TypeScript if you have a good enough excuse)
 - Render the mushrooms on a OpenStreetMap.
 - If you click on one of the mushrooms it should show a popup with the mushroom properties.
 - Show two selectboxes to filter the mushrooms on respectivaly the spots and color properties.
 - Both selectboxes have a button to clear the selection.

The mushrooms need to be filterd with two selectboxes. One of the selectboxes will be for the color and the other for spots.
if for example, the color GREEN is selected the map will only show the mushrooms with the color property GREEN. Also the selectbox for spots will only show the kind of spots that are left. Next will be an example of a state situation.

3 kind of Mushrooms: 
```
{:name 'nervous Bell' :spots :double :color :green}
{:name 'nice Benz' :spots :dashed :color :red}
{:name 'quizzical Chaplygin' :spots :double :color :blue}
```
If double is selected in the spots selectbox, only the green and blue options will be available in the colors select box, also only nervous bell and quizzical chaplygin will be visible on the map.

## Other requirements
 - Use whatever web framework or technology you want
 - Make a git Repo and host it on the interent (Github, BitBucket).
 - Supply a README with instructions on how to run the project.
 
## Bunus feature
 - Get some (random) mushroom images from a image api.
 - Use your imagination.
# fungus_friends
