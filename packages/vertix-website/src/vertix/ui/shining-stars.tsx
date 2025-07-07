import "@vertix.gg/website/src/vertix/ui/shining-stars.scss";

const ShiningStars = () => {
    const starCount = 60;
    const stars = [];

    for ( let i = 0; i < starCount; i++ ) {
        const style = {
            top: `${ Math.random() * 250 }px`,
            left: `${ Math.random() * 100 }%`,
            animationDelay: `${ Math.random() * 5 }s`,
            animationDuration: `${ 2 + Math.random() * 3 }s`,
        };
        stars.push( <div className="star" key={ i } style={ style }/> );
    }

    return <div className="shining-stars-container">{ stars }</div>;
};

export default ShiningStars;
