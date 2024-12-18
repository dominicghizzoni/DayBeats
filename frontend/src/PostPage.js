import React from 'react';

const PostPage = () => {
    return (
        <div style={styles.container}>
            <h1>Post Something</h1>
            <p>Welcome to the post page!</p>
            <form>
                <textarea placeholder="Write something..." rows="5" cols="50" />
                <br />
                <button type="submit">Post</button>
            </form>
        </div>
    );
};

const styles = {
    container: {
        marginLeft: '220px', // Leaves space for the sidebar
        marginTop: '80px', // Leaves space for the top bar
        padding: '20px', // Adds padding for better readability
    },
};

export default PostPage;
