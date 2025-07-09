
import { styles } from '@/styles/feed.style';
import { formatDistanceToNow } from 'date-fns';
import { Text } from 'react-native';
import { Image, View } from 'react-native';

interface Comment {
    content: string;
    _creationTime: number;
    user: {
        fullname: string;
        image: string;
    };
}

export default function Comment({ comment } : { comment: Comment}) {
    return (
        <View style={styles.commentContainer}>
            <Image source={{ uri: comment.user.image }} style={styles.commentAvatar}/>
            <View style={styles.commentContent}>
            <Text style={styles.commentUsername}>{comment.user.fullname}</Text>
            <Text style={styles.commentText}>{comment.content}</Text>
            <Text style={styles.commentTime}>
                {formatDistanceToNow(comment._creationTime, { addSuffix: true })}
            </Text>
            </View>
        </View>
    )
}










// import { styles } from '@/styles/feed.style';
// import { formatDistanceToNow } from 'date-fns';
// import { Text, View, Image } from 'react-native';

// interface Comment {
//   content: string;
//   _creationTime: number;
//   user?: {
//     fullname: string;
//     image: string;
//   };
// }

// export default function Comment({ comment }: { comment: Comment }) {
//   // Provide fallback if user is missing
//   // const user = comment.user ?? {
//   //   fullname: "Unknown User",
//   //   image: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg",
//   // };

//   return (
//     <View style={styles.commentContainer}>
//       <Image
//         source={{ uri: user.image }}
//         style={styles.commentAvatar}
//       />
//       <View style={styles.commentContent}>
//         <Text style={styles.commentUsername}>{user.fullname}</Text>
//         <Text style={styles.commentText}>{comment.content}</Text>
//         <Text style={styles.commentTime}>
//           {formatDistanceToNow(comment._creationTime, { addSuffix: true })}
//         </Text>
//       </View>
//     </View>
//   );
// }
