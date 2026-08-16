# My Sky

A little window that shows you your own weather. You write a few lines about your day, and the sky above changes to match how you're feeling. Clear skies for good days, storms for the hard ones, rainbows when things are turning around.

## Why I made this

I wanted something that didn't feel like homework. Most mood trackers hand you a form, a slider, a mood scale from 1 to 10, and honestly none of that ever made me want to open the app twice. So I built the thing I actually wanted: you just write, like you're telling a friend how your day went, and the sky does the rest. No scores, no streak guilt, no pressure. Just a quiet little ritual you can come back to.

Every cloud, every sun ray, every raindrop in the sky is hand drawn by me. That part took way longer than the code did, but it's the part I'm proudest of. It felt important that the thing looking back at you actually feels warm and made with care, not generated.

## How it helps with wellness

Putting feelings into words is one of the simplest things you can do for yourself, and it's also one of the easiest things to skip on a busy day. My Sky tries to lower the barrier as much as possible. You don't need the right words or a diagnosis or a reason. You just write, and the sky quietly reflects it back to you so you can actually see how you've been, day by day, instead of just carrying it around in your head. Over time the little calendar becomes a gentle record, not of how productive you were, but of how you actually felt, which I think matters just as much.

## Under the hood

Local keyword matching does the first pass instantly, so the sky reacts the moment you type. In the background, a Hugging Face model takes a closer look and refines the read if it can reach it in time. If it can't, the app doesn't complain or break, it just keeps going with what it already knows. Your entries stay on your device unless that backend call happens, and nothing is ever stored on the server end.

## Track

Submitting under Wellness. It's a mood journal at heart, just one that's trying a little harder to make you want to actually use it. Also submitted for both bonus tracks: Most Viral and Best Use of AI
