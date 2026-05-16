import { useState } from "react"

import Image from "../layouts/Images"

function ProfileImage({ user, big = false }) {
    return <Image
        src={`/api/users/avatar?id=${user.id}&v=${user.avatarVersion}`}
        alt={`${user.name} profile`}
        width={big ? "80px" : undefined}
        height={big ? "80px" : undefined}
        isRound=""
    />
}

export default ProfileImage