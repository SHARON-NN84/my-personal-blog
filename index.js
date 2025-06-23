// this is where our information will be monitored
let currentlySelectedPost = null; // this will store any post the user clicked on or chose 
let allThePosts = []; // array to hold all  posts used
let isStillLoading = false; // status flag to track whether a prosses loading is happening or not

// this function  helps everything start when the page loads
function startEverything() {
    getAllPostsFromServer();
    makeNewPostFormWork();
}

// this function grabs all posts from our fake API and shows them on the screen!
async function getAllPostsFromServer() {
    try {
        // here wait for the waiter and hope he brings some good food!
        const serverResponse = await fetch('http://localhost:3000/posts');
        const allPosts = await serverResponse.json();
        allThePosts = allPosts; // store them globally it's very much okay to do so!
        
        // find the div where all our posts will stay
        const postsContainer = document.getElementById('post-list'); // changed from var to const like a good programmer
        
        // wipe out whatever was there before
        postsContainer.innerHTML = '';
        
        // loop and make it clickable
    
        allPosts.forEach(post => {

            const singlePost = allPosts[i];
            const postDiv = document.createElement('div');
            postDiv.className = 'blog-post';
            postDiv.innerHTML = `
                <div class="post-title">${singlePost.title}</div>
                <div class="post-author">by ${singlePost.author}</div>
            `;
            
            // make it so when you click on a post, it shows the details
            postDiv.addEventListener('click', function(event) {
                showTheFullPost(singlePost.id, event);
            });
            
            postsContainer.appendChild(postDiv);
        }
        
        console.log('yay! loaded', allPosts.length, 'posts without breaking anything');
    } catch (error) {
        console.error('something went wrong loading posts:', error);
        document.getElementById('post-list').innerHTML = '<p style="color: red;">Oops! Failed to load posts. Make sure json-server is running!</p>';
    }
}

// show all the good stuff for whatever post the user clicked on or chose 
async function showTheFullPost(postId, event) {
    try {
        // grab the full post data from our server
        //this was easy but tricky lol
        const serverResponse = await fetch(`http://localhost:3000/posts/${postId}`);
        const clickedPost = await serverResponse.json();
        currentlySelectedPost = clickedPost; // remember which one we're looking at
        
        // build out the HTML to show all the post info
        const detailsSection = document.getElementById('post-detail');
        detailsSection.innerHTML = `
            <h3>${clickedPost.title}</h3>
            <p><strong>Author:</strong> ${clickedPost.author}</p>
            <div style="margin-top: 15px;">
                <strong>Content:</strong>
                <p style="margin-top: 10px; line-height: 1.5;">${clickedPost.content}</p>
            </div>
            <div class="button-group">
                <button onclick="showEditForm()" class="btn btn-gray">Edit Post</button>
                <button onclick="deleteThisPost(${clickedPost.id})" class="btn btn-red">Delete Post</button>
            </div>
        `;
        
        // make the clicked post look selected in the list this was not easy!
        document.querySelectorAll('.blog-post').forEach(postItem => {
            postItem.classList.remove('selected');
        });
        event.target.closest('.blog-post').classList.add('selected');
        
        // hide the edit form if it's on dispalyy
        document.getElementById('edit-post-form').classList.add('hide');
        
    } catch (error) {
        console.error('ugh, something broke when trying to show post details:', error);
    }
}

// make the new post form actually do something when you click submit
function makeNewPostFormWork() {
    const newPostForm = document.getElementById('new-post-form');
    
    newPostForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // stop the page from refreshing like it normally does 
        
        // grab whatever the user typed into the form fields
        const titleText = document.getElementById('post-title').value;
        const contentText = document.getElementById('post-content').value;
        const authorName = document.getElementById('post-author').value;
        
        const brandNewPost = {
            title: titleText,
            content: contentText,
            author: authorName
        };
        
        try {
            // now send it to the server yaayyy
            const serverResponse = await fetch('http://localhost:3000/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // tell the server we are sending JSON
                },
                body: JSON.stringify(brandNewPost)
            });
            
            if (serverResponse.ok) {
                // wipe the form clean 
                newPostForm.reset();
                
                // refresh everything to show the new post
                //I can see i made progress actually
                getAllPostsFromServer();
                
                alert('Woohoo! New post created successfully!');
            } else {
                alert('Hmm, something went wrong adding the post');
            }
        } catch (error) {
            console.error('oops, error adding new post:', error);
            alert('Couldn\'t add the post, maybe try again?');
        }
    });
}

// show the form where you can edit whatever post is currentlly selected
function showEditForm() {
    if (!currentlySelectedPost) return; // go back if nothing is selected 
    
    // pre-fill the form with whatever is already there
    document.getElementById('edit-title').value = currentlySelectedPost.title;
    document.getElementById('edit-content').value = currentlySelectedPost.content;
    
    // make the edit form visible
    //so that you can see what youre doing lol
    document.getElementById('edit-post-form').classList.remove('hide');
    
    // make the form do something when its being submitted
    const editForm = document.getElementById('edit-post-form');
    editForm.onsubmit = async function(e) {
        e.preventDefault(); // avoid refreshing the page
        
        // create the updated post object with new values
        const updatedPostData = {
            ...currentlySelectedPost, // keep everything as it is
            title: document.getElementById('edit-title').value, // except update these
            content: document.getElementById('edit-content').value
        };
        
        try {
            // send the update to your server
            const serverResponse = await fetch(`http://localhost:3000/posts/${currentlySelectedPost.id}`, {
                method: 'PATCH', // PATCH because we're just updating someof the fields
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedPostData)
            });
            
            if (serverResponse.ok) {
                // hide the edit form
                editForm.classList.add('hide');
                
                // refresh everything so we can see the changes
                getAllPostsFromServer();
                // refresh selected post details after the edit
                setTimeout(() => {
                    const selectedPostElement = document.querySelector('.blog-post.selected');
                    if (selectedPostElement) {
                        selectedPostElement.click();
                    }
                }, 100);
                
                alert('Sweet! Post updated successfully!');
            }
        } catch (error) {
            console.error('dang it, error updating post:', error);
            alert('Ugh, failed to update post. Try again maybe?');
        }
    };
}

// let the user cancel out of editing mode if they want cause free will is a thing btw
document.getElementById('cancel-edit-btn').addEventListener('click', function() {
    document.getElementById('edit-post-form').classList.add('hide');
});

// this function erases a post from existence
// added a confirmation dialog to avoid accidental deletion of things!
async function deleteThisPost(postId) {
    if (!confirm('Are you REALLY sure you want to delete this post? This cannot be undone!')) {
        return; // the user didn't want to continue withh the process 
    }
    
    try {
        // tells the server to delete this post
        const serverResponse = await fetch(`http://localhost:3000/posts/${postId}`, {
            method: 'DELETE' //well now you've gotten rid of it like completely 
        });
        
        if (serverResponse.ok) {
            // clear out the details area
            document.getElementById('post-detail').innerHTML = '<p style="color: #666; font-style: italic;">Click on a post to see details here...</p>';
            currentlySelectedPost = null; // nothing is selected anymore
            
            // refresh the list so the deleted post disappears
            getAllPostsFromServer();
            
            alert('Post deleted successfully! (kinda sad but oh well)');
        } else {
            alert('Hmm, failed to delete post for some reason');
        }
    } catch (error) {
        console.error('something went wrong while trying to delete:', error);
        alert('Oops! Something went wrong while deleting');
    }
}

// start the whole process when the page finishes loading

document.addEventListener('DOMContentLoaded', startEverything);
