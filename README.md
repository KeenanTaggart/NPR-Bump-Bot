# NPR Bump Bot


The project is comprised of a small handful of scripts which perform discrete tasks. In concert they complete the following:
1. Get track and artist names from daily NPR programs.
2. Submit the scraped information to the Spotify API, receiving links for the specified tracks.
3. Post a few links to a designated Twitter account (@nprBumpBot).

The Twitter account has been in operation for ~1.5 years at the time of this writing.
It can be visited here: https://twitter.com/nprBumpBot

In its current state, the scripts sometimes result in duplicate songs being posted. Additionally,
behavior when the NPR website has no songs listed is undefined (it generally just defaults back to
a previous song list, sometimes duplicating previous tweets). Consequently, a future update would 
likely make the following changes:
1. Once pulled, songs would be placed in a random order and tweets would iterate through this order. A counter
would be maintained to keep track of progress through the order. Consequently, failure to pull a new list of
tracks would default to moving further through a previous list, preventing duplicates.
2. Explicitly define what happens when the scripts iterate through the whole track list.
3. Remove extraneous print statements (or otherwise give them appropriate behavior, i.e. print to <i>stderr</i>).
