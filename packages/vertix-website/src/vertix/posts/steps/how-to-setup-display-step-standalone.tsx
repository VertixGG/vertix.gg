import { useParams } from "react-router-dom";

import HowToSetupStep1 from "@vertix/posts/steps/how-to-setup-step-1";
import HowToSetupStep2 from "@vertix/posts/steps/how-to-setup-step-2";
import HowToSetupStep3 from "@vertix/posts/steps/how-to-setup-step-3";

export default function HowToSetupDisplayStepStandalone() {
    const getStep = ( step: number ) => {
        switch ( step ) {
            case 1:
            default:
                return <HowToSetupStep1/>;

            case 2:
                return <HowToSetupStep2/>;

            case 3:
                return <HowToSetupStep3/>;
        }
    };

    const { step= "0" } = useParams();

    return (
        <>
            <div className="container box-1">
                {
                    <ul>
                        {
                            getStep( parseInt( step ) )
                        }
                    </ul>
                }
            </div>
        </>
    );
}
