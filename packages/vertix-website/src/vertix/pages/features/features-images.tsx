import { useState } from "react";

import { PhotoProvider, PhotoView } from "react-photo-view";

import { allImagesLoadedPromise } from "@internal/utils/loading";

import LoadingContainer from "@vertix/ui/loading-container";

( () => {
    // @ts-ignore
    import ( "./features-images.scss" );
} )();


const images_v_0_0_0 = {
    '101.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_0/101.png?v=1',
    '102.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_0/102.png',
    '103.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_0/103.png',
    '104.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_0/104.png',
    '105.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_0/105.png',
    '106.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_0/106.png',
    '107.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_0/107.png',
    '108.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_0/108.png',
    '109.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_0/109.png',
    '1010.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_0/1010.png',
    '1011.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_0/1011.png',
    '1012.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_0/1012.png',
    '1013.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_0/1013.png',
    '1014.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_0/1014.png',
    '1015.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_0/1015.png',
    '1016.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_0/1016.png',
    '1017.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_0/1017.png',
    '1018.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_0/1018.png',
    '1019.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_0/1019.png',
    'a.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_0/a.png',
    'b.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_0/b.png',
    'd.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_0/d.png',
    'z.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_0/z.png'
};

const images_v_0_0_3 = {
    '000.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/000.png',
    '001.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/001.png',
    '002.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/002.png',
    '003.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/003.png',
    '004.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/004.png',
    '005.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/005.png',
    '006.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/006.png',
    '007.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/007.png',
    '008.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/008.png',
    '009.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/009.png',
    '010.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/010.png',
    '011.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/011.png',
    '012.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/012.png',
    '013.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/013.png',
    '014.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/014.png',
    '015.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/015.png',
    '016.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/016.png',
    '017.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/017.png',
    '018.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/018.png',
    '019.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/019.png',
    '020.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/020.png',
    '021.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/021.png',
    '022.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/022.png',
    '024.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/024.png',
    '025.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/025.png',
    '026.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/026.png',
    '027.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_3/027.png'
};

const images_v_0_0_4 = {
    '1.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_4/1.png',
    '2.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_4/2.png',
    '3.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_4/3.png',
    '4.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_4/4.png',
    '5.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_4/5.png',
    '6.png': 'https://vertix.twic.pics/images/features-images/images_v_0_0_4/6.png'
};

export function ImagesGallery( props: { show: boolean } ) {
    return (
        <div className={ `container box-1 image-gallery ${ props.show ? "visible" : "invisible" }` }>
            <h2>Features Images</h2>
            <br/>

            <h5>Updated at: 20/06/2023, v0.0.4</h5>
            <div className={ "d-flex justify-content-center row p-3" }>
                <PhotoProvider>
                    { Object.values( images_v_0_0_4 ).map( ( image, index ) => (
                        <PhotoView key={ index } src={ image }><img src={ image } alt=""/></PhotoView>
                    ) ) }
                </PhotoProvider>
            </div>

            <h5>Updated at: 16/06/2023, v0.0.3</h5>
            <h6><b>Setup</b> demonstration</h6>
            <div className={ "d-flex justify-content-center row p-3" }>
                <PhotoProvider>
                    { Object.values( images_v_0_0_3 ).map( ( image, index ) => (
                        <PhotoView key={ index } src={ image }><img src={ image } alt=""/></PhotoView>
                    ) ) }
                </PhotoProvider>
            </div>

            <h5>Updated at: 03/06/2023, v0.0.0</h5>
            <h6><b>Dynamic Channel</b> management demonstration</h6>
            <div className={ "d-flex justify-content-center row p-3" }>
                <PhotoProvider>
                    { Object.values( images_v_0_0_0 ).map( ( image, index ) => (
                        <PhotoView key={ index } src={ image }><img src={ image } alt=""/></PhotoView>
                    ) ) }
                </PhotoProvider>
            </div>
        </div>
    )
}

export default function FeaturesImages() {
    const [ isImagesLoaded, setIsImagesLoaded ] = useState( false );

    setTimeout( () => {
        allImagesLoadedPromise().then( () => {
            setIsImagesLoaded( true );
        } );
    } );

    return (
        <>
            {
                ! isImagesLoaded && <LoadingContainer/>
            }
            <ImagesGallery show={ isImagesLoaded }/>
        </>
    )

}
