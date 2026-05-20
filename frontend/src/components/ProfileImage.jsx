import { useState } from "react"

import Image from "../layouts/Images"

function ProfileImage({ user, big = false, icon = false }) {
    return <Image
        src={`/api/users/avatar?id=${user.id}&icon=${icon}&v=${user.avatarVersion}`}
        alt={`${user.name} profile`}
        width={big ? "80px" : undefined}
        height={big ? "80px" : undefined}
        isRound=""
    />
}

export default ProfileImage